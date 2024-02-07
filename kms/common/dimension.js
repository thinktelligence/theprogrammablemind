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
      bridge: "{ ...next(operator), amount: before[0] }",
    },
    { 
      id: "amountOfDimension", 
      convolution: true, 
      bridge: "{ marker: operator('dimension'), unit: after[0], amount: before[0] }" 
    },
    { 
      where: where(),
      id: "convertToUnits", 
      bridge: "{ ...next(operator), from: before[0], to: after[0] }",
      generatorp: ({context, g}) => `${g(context.from)} ${context.word} ${g(context.to)}`,
      evaluator: ({context}) => {
        const from = context.from;
        const to = context.to;
        // from => to => formula
        const conversion = {
          "celcius": {
            "fahrenheit": (celcius) => celcius*9/5 + 32,
          },
          "fahrenheit": {
            "celcius": (fahrenheit) => (fahrenheit-32)*5/9,
          },
        }

        const value = conversion[from.unit.marker][to.marker](from.amount.amount.value)
        console.log('value', value)
        context.evalue = value
      },
    },
    { id: "unit", },
  ]
};

config = new Config(config, module)
config.add(base).add(formulas).add(testing)
config.api = api
config.initializer( ({config, api, isAfterApi, isModule}) => {
  if (!isModule && isAfterApi) {
    api.setup({ 
      dimension: 'temperature',
      units: ['celcius', 'fahrenheit', 'kelvin'],
    })
  }
}, { initAfterApi: true });


knowledgeModule({ 
  module,
  description: 'Used to define numeric temperature such as currency, temperature or weight',
  config,
  test: {
    name: './dimension.test.json',
    contents: dimension_tests
  },
})
