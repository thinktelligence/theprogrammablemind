const { debug, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultObjectCheck, defaultContextCheck, defaultContextCheckProperties } = require('./helpers')
const hierarchy = require('./hierarchy.js')
const formulas = require('./formulas.js')
const testing = require('./testing.js')
const tests = require('./dimension.test.json')
const instance = require('./dimension.instance.json')

/*
  x celcius equals x*9/5 + 32 fahrenheit
  x fahrenheit equals (x-32)*5/9 + 32 fahrenheit
  10 celcius + 5

  1 meter 10 centimeters

  1 meter in feet and inches
  10 feet in meters and inches

  show length in feet and inches
  show length in meters and millimeters

  10 C

  use a digraph for calculating convertions

  can you convert between all units of length
  configure the conversions for length
  "square kilometers" is a phrase
  for weight what can you convert between
  what can you convert between for weight
  what is the conversion between pounds and kilograms
*/
class API {

  initialize({ config, objects }) {
    this._config = config
    this._objects = objects
  }

  setMeasurementSystem(measurementSystem) {
    this._objects.measurementSystem = measurementSystem
  }

  // if the user says 2 feet deduce english etc
  deduceMeasurementSystem(utterance) {
  }

  getMeasurementSystem() {
    return this._objects.measurementSystem
  }

  setup( {dimension, units} ) {
    const config = this._config

    // for example, setup temperature concept
    config.addOperator(`([${dimension}])`)
    config.addBridge({ 
      id: dimension,
      isA: ['dimension'],
      generatorp: async ({context, g}) => context.amount ? `${await g(context.amount)} ${await g(context.unit)}` : context.word,
    })

    // for example, celcius and fahrenheit
    for (const unit of units) {
      config.addOperator(`([${unit}])`)
      config.addBridge({ 
        id: unit,
        isA: ['unit'],
      })
    }
  }
}

// eg, dimension == length; meters == unit; 2 meters == quantity

const config = {
  name: 'dimension',
  operators: [
    "([quantity])",
    "([unit])",
    "((amount/* || number/*) [amountOfCoordinate|] ([unit]))",
    "(([amount]) [unit])",
    "((@<=quantity || context.possession == true) [convertToUnits|in] (unit))",

    "(([number]) [degree])",
    { pattern: "([length])", scope: "testing" },
  ],
  priorities: [
    // TODO this should have been calculated
    { "context": [['amountOfCoordinate', 0], ['convertToUnits', 0], ], "choose": [0] },
  ],
  hierarchy: [
    { child: 'convertToUnits', parent: 'testingValue', scope: "testing" },
  ],
  generators: [
    {
      where: where(),
      match: ({context}) => context.marker == 'noconversion',
      apply: async ({context, gp}) => `there is no conversion between ${await gp(context.from)} and ${await gp(context.to)}`,
    },
  ],
  bridges: [
    { 
      where: where(),
      id: "dimension", 
    },
    { 
      where: where(),
      id: "quantity", 
      isA: ["noun"],
      bridge: "{ ...next(operator) }",
      generatorpr: async ({context, gp, gr}) => `${await gr(context.amount)} ${await gp(context.unit)}`,
    },
    { 
      id: "length", 
      isA: ['dimension'], 
      bridge: "{ ...next(operator) }",
      scope: "testing" 
    },
    { id: "amount", },
    { 
      where: where(),
      id: "degree", 
      words: [{ word: 'degrees', number: 'many' }],
      isA: ['amount'],
      generatorp: async ({context, g}) => (context.amount) ? `${await g(context.amount)} ${context.word}` : context.word,
      bridge: "{ ...next(operator), value: before[0].value, amount: before[0] }",
    },
    { 
      id: "amountOfCoordinate", 
      convolution: true, 
      bridge: "{ marker: next(operator('quantity')), dead: true, unit: after[0], value: before[0].value, amount: before[0] }" 
    },
    { 
      where: where(),
      id: "convertToUnits", 
      bridge: "{ ...next(operator), from: before[0], to: after[0] }",
      isA: ['expression', 'queryable'],
      localHierarchy: [['unknown', 'dimension']],
      after: [['possession', 0], ['possession', 1]],
      generatorp: async ({context, g}) => `${await g(context.from)} ${context.word} ${await g(context.to)}`,
      // evaluator: ({context, kms, error}) => {
      evaluator: async ({context, kms, e, error, toArray, gp, gr, toList}) => {
        const from = context.from;
        const tos = toArray(context.to);
        let evalue;
        let efrom = from
        if (!from.unit) {
          efrom = (await e(from)).evalue
        }
        async function convert(to) {
          if (to.value == efrom.unit.value) {
            evalue = efrom.amount
            evalue.evalue = efrom.amount.value
          } else {
            const formula = kms.formulas.api.get(to, [efrom.unit])
            if (!formula) {
              const reason = { marker: 'reason', focusableForPhrase: true, evalue: { marker: 'noconversion', from: efrom.unit, to } }
              kms.stm.api.mentioned({ context: reason })
              error(reason)
            }
            kms.stm.api.setVariable(efrom.unit.value, efrom.amount)
            evalue = await e(formula)
          }
          return evalue
        }

        let evalues = []
        for (const to of tos) {
          evalues.push({ value: await convert(to), to: structuredClone(to) })
        }
        evalues.sort((a, b) => a.evalue - b.evalue )

        let fractionalPart = 0
        let scale = 1
        for (const evalue of evalues) {
          const value = evalue.value.evalue * scale
          const integerPart = Math.trunc(value)
          fractionalPart = Math.abs(value - integerPart)
          evalue.value.evalue = integerPart
          scale = fractionalPart / value * scale
        }
        // evalues[evalues.length-1].value.evalue = Number((integerPart * (1+scale)).toFixed(4))
        evalues[evalues.length-1].value.evalue += fractionalPart
        evalues[evalues.length-1].value.evalue = Number(evalues[evalues.length-1].value.evalue.toFixed(4))

        // remove the zeros
        evalues = evalues.filter( (evalue) => evalue.value.evalue )

        /*
        '{
            "marker":"dimension",
            "unit":{"marker":"unit","range":{"start":19,"end":25},"word":"celcius","text":"celcius","value":"celcius","unknown":true,"types":["unit","unknown"]},
            "value":10,
            "amount":{"word":"degrees","number":"many","text":"10 degrees","marker":"degree","range":{"start":8,"end":17},"value":10,"amount":{"value":10,"text":"10","marker":"number","word":"10","range":{"start":8,"end":9},"types":["number"]}},
              "text":"10 degrees celcius","range":{"start":8,"end":25}}'
        */
        evalues = evalues.map((evalue) => {
          const number = evalue.value.evalue == 1 ? 'one' : 'many'
          evalue.to.number = number
          return { 
            paraphrase: true,
            marker: 'quantity',
            level: 1,
            unit: evalue.to,
            amount: { evalue: evalue.value, paraphrase: undefined }
          }
        })
        if (evalues.length > 1) {
          context.evalue = toList(evalues)
        } else {
          context.evalue = evalues[0]
        }
      },
    },
    { 
      id: "unit", 
      isA: ['number'],
    },
  ],
};

const template = {
  configs: [
    "measurement modifies unit",
    "dimension and measurement unit are concepts",
    "unit means measurement unit",
    ({apis}) => {
      apis('properties').addHierarchyWatcher({
        match: ({parentId, isA}) => isA(parentId, 'unit') && parentId.startsWith('unit_'),
        apply: ({config, childId, parent, parentId}) => {
          config.updateBridge(childId, ({ bridge }) => {
            if (!bridge.init) {
              bridge.init = {}
            }
            // bridge.init['dimension'] = parent.object.marker
            bridge.init['dimension'] = parent.object.value
          })
        }
      })
    },
    "metric modifies system",
    "imperial modifies system",
    "measurement modifies system",
    "the metric system is a measurement system",
    "the imperial system is a measurement system",
    "imperial modifies unit",
    "metric modifies unit",
    "imperial unit is a unit",
    "metric unit is a unit",
    config,
    {
      operators: [
        "([useMeasurementSystem|use] (measurement_system))",
      ],
      bridges: [
        {
          id: 'useMeasurementSystem',
          isA: ['verb'],
          bridge: "{ ...next(operator), system: after[0], interpolate: [ { context: operator }, { property: 'system' } ] }",
          semantic: ({context, api}) => {
            api.setMeasurementSystem(context.system.value)
          },
          check: defaultContextCheckProperties(['system']),
        },
      ],
    },
  ],
}

knowledgeModule({ 
  config: { name: 'dimension' },
  includes: [hierarchy, formulas, testing],
  api: () => new API(),

  module,
  description: 'Used to define numeric temperature such as currency, temperature or weight',
  instance,
  template,
  test: {
    name: './dimension.test.json',
    contents: tests,
    checks: {
      objects: [
        { km: 'properties' },
        { path: ['measurementSystem'] },
      ],
      context: [
        defaultContextCheck({ marker: 'metric_system', exported: true }),
        defaultContextCheck({ marker: 'convertToUnits', exported: true, extra: ['from', 'to'] }),
        defaultContextCheck({ 
          match: ({context, isA}) => isA(context.marker, 'unit'), 
          exported: true, 
          extra: ['dimension'],
        }),
        // defaultContextCheck(['dimension', 'response']),
      ],
    },
  },
})
