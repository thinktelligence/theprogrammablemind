const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const base = require('./dimensionTemplate.js')
const formulas = require('./formulas.js')
const testing = require('./testing.js')
const dimension_tests = require('./dimension.test.json')

/*
  x celcius equals x*9/5 + 32 fahrenheit
  x fahrenheit equals (x-32)*5/9 + 32 fahrenheit
  10 celcius + 5

  10 C

  use a digraph for calculating convertions

  can you convert between all units of length
  configure the conversions for length
  "square kilometers" is a phrase
*/
class API {

  initialize() {
  }

  setup( {dimension, units} ) {
    const config = this.config()

    // for example, setup temperature concept
    config.addOperator(`([${dimension}])`)
    config.addBridge({ 
      id: dimension,
      isA: ['dimension'],
      generatorp: ({context, g}) => context.amount ? `${g(context.amount)} ${g(context.unit)}` : context.word,
    })

    // for example, celcius and fahrenheit
    for (let unit of units) {
      config.addOperator(`([${unit}])`)
      config.addBridge({ 
        id: unit,
        isA: ['unit'],
      })
    }
  }
}

const api = new API()

let config = {
  name: 'dimension',
  operators: [
    "([dimension])",
    "([unit])",
    // "(([unit]) [kindOfDimension|of] ([dimension]))",
    "((amount/1 || number/1) [amountOfDimension|] ([unit]))",
    "(([amount]) [unit])",
    "((dimension/1) [convertToUnits|in] (unit/1))",

    "(([number]) [degree])",
    { pattern: "([length])", development: true },
  ],
  priorities: [
    // TODO this should have been calculated
    [['convertToUnits', 0], ['amountOfDimension', 0]],
  ],
  hierarchy: [
    { child: 'convertToUnits', parent: 'testingValue', development: true },
  ],
  bridges: [
    { 
      where: where(),
      id: "dimension", 
      isA: [],
      generatorp: ({context, g}) => context.amount ? `${g(context.amount)} ${g(context.unit)}` : context.word,
    },
    { id: "length", isA: ['dimension'], development: true },
    { id: "amount", },
    /*
    { 
      id: "kindOfDimension", 
      bridge: "{ ...next(operator), subclass: before[0], class: after[0], value: concat(before[0].marker.id, after[0].marker.id) }",
      // bridge: "{ ...next(operator), subclass: before[0], class: after[0], value: concat(before[0].marker, after[0].marker) }",
      isA: ['preposition'],
      generatorp: ({context, gp}) => `${gp(context.subclass)} ${context.word} ${gp(context.class)}`,
    },
    */
    { 
      where: where(),
      id: "degree", 
      words: [{ word: 'degrees', number: 'many' }],
      isA: ['amount'],
      generatorp: ({context, g}) => (context.amount) ? `${g(context.amount)} ${context.word}` : context.word,
      bridge: "{ ...next(operator), value: before[0].value, amount: before[0] }",
    },
    { 
      id: "amountOfDimension", 
      convolution: true, 
      bridge: "{ marker: operator('dimension'), unit: after[0], value: before[0].value, amount: before[0] }" 
    },
    { 
      where: where(),
      id: "convertToUnits", 
      bridge: "{ ...next(operator), from: before[0], to: after[0] }",
      isA: ['expression', 'queryable'],
      generatorp: ({context, g}) => `${g(context.from)} ${context.word} ${g(context.to)}`,
      // evaluator: ({context, kms, error}) => {
      evaluator: ({context, kms, e}) => {
        /*
        error(({context, e}) => {
          context.evalue = 'dont know...'
        })
        */
        const from = context.from;
        const to = context.to;
        const formula = kms.formulas.api.get(to, [from.unit])
        kms.stm.api.setVariable(from.unit.value, from.amount)
        const evalue = e(formula)
        /*
        '{
            "marker":"dimension",
            "unit":{"marker":"unit","range":{"start":19,"end":25},"word":"celcius","text":"celcius","value":"celcius","unknown":true,"types":["unit","unknown"]},
            "value":10,
            "amount":{"word":"degrees","number":"many","text":"10 degrees","marker":"degree","range":{"start":8,"end":17},"value":10,"amount":{"value":10,"text":"10","marker":"number","word":"10","range":{"start":8,"end":9},"types":["number"]}},
              "text":"10 degrees celcius","range":{"start":8,"end":25}}'
        */
        context.evalue = { 
          paraphrase: true,
          marker: 'dimension',
          unit: to,
          amount: { evalue, paraphrase: undefined }
        }
      },
    },
    { id: "unit", },
  ]
};

config = new Config(config, module)
config.add(base).add(formulas).add(testing)
config.api = api
/*
config.initializer( ({config, api, isAfterApi, isModule}) => {
  if (!isModule && isAfterApi) {
    api.setup({ 
      dimension: 'temperature',
      units: ['celcius', 'fahrenheit', 'kelvin'],
    })
  }
}, { initAfterApi: true });
*/

knowledgeModule({ 
  module,
  description: 'Used to define numeric temperature such as currency, temperature or weight',
  config,
  test: {
    name: './dimension.test.json',
    contents: dimension_tests,
    /*
    check: [
      { km: 'properties' },
    ]
    */
  },
})
