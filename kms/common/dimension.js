const { debug, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { toFinalValue, defaultObjectCheck, defaultContextCheck, defaultContextCheckProperties } = require('./helpers')
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

  async getPreferredUnits(quantity) {
    const preferredUnits = await this.args.recall({
      context: { marker: 'unit' },
      condition: (unit) => {
        if (quantity.unit.marker == 'unitPerUnit') {
          if (quantity.unit.numerator?.dimension == unit.numerator?.dimension &&
              quantity.unit.denominator?.dimension == unit.denominator?.dimension) {
            return true
          }
        } else if (unit.dimension) {
          if (unit.dimension == quantity.unit.dimension) {
            return true
          }
        }
      },
    })
    return preferredUnits
  }

  setPreferredUnits(units) {
    this.args.remember(units)
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

  async convertToUnits(context, from, tos) {
    const {kms, e, error, toArray, gp, gr, toList} = this.args
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
          kms.stm.api.remember({ context: reason })
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
      const value = toFinalValue(evalue) * scale
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
      return toList(evalues)
    } else {
      return evalues[0]
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
    "([forQuantity|for] (@<= quantity && !context.unit.dimension == null))",

    "([useUnits|use] (unit))",
    "([preferredUnits] (quantity))",
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
      id: 'forQuantity',
      isA: ['preposition'],
      bridge: "{ ...operator, quantity: after[0], operator: operator, interpolate: [ { property: 'operator' }, { property: 'quantity' } ] }",
      check: defaultContextCheckProperties(['quantity']),
    },
    { 
      where: where(),
      id: "preferredUnits",
      isA: ['verb'],
      bridge: "{ ...next(operator), quantity: after[0], operator: operator, interpolate: [{ property: 'operator' }, { property: 'quantity' }] }",
      semantic: async ({context, e, api, toArray, resolveResponse}) => {
        const preferredUnits = await api.getPreferredUnits(context.quantity)
        if (!preferredUnits) {
          return
        }
        const from = context.quantity;
        const value = await e({ marker: 'convertToUnits', from, to: preferredUnits })
        resolveResponse(context, value.evalue)
      }
    },
    { 
      where: where(),
      id: "useUnits",
      isA: ['verb'],
      bridge: "{ ...next(operator), units: after[0], operator: operator, interpolate: [{ property: 'operator' }, { property: 'units' }] }",
      semantic: ({context, api}) => {
        api.setPreferredUnits(context.units)
      }
    },
    { 
      where: where(),
      id: "dimension", 
    },
    { 
      where: where(),
      id: "quantity", 
      isA: ['noun'],
      check: defaultContextCheckProperties(['amount', 'unit']),
      // bridge: "{ ...next(operator) }",
      generatorp: {
        level: 1, 
        match: ({context}) => context.amount && context.unit,
        apply: async ({context, g, gp, gr}) => `${await g(context.amount)} ${await gp(context.unit)}`,
      },
      generatorr: {
        level: 1,
        match: ({context}) => context.amount && context.unit,
        apply: async ({context, gp, gr}) => `${await gr(context.amount)} ${await gp(context.unit)}`,
      },
    },
    { 
      id: "length", 
      isA: ['dimension'], 
      bridge: "{ ...next(operator) }",
      scope: "testing" 
    },
    { 
      id: "amountOfCoordinate", 
      convolution: true, 
      before: ['preposition'],
      // bridge: "{ marker: next(operator('quantity')), dead: true, unit: after[0], value: before[0].value, amount: before[0] }" 
      bridge: "{ marker: next(operator('quantity')), dead: true, unit: after[0], amount: before[0] }" 
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
      evaluator: async ({context, api, toArray, resolveEvaluate}) => {
        const from = context.from;
        const tos = toArray(context.to);
        resolveEvaluate(context, await api.convertToUnits(context, from, tos))
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
    "amount is a concept",
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
        { km: 'stm' },
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
