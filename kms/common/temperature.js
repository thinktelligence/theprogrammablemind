const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const gdefaults = require('./gdefaults.js')
const numbers = require('./numbers.js')
const testing = require('./testing.js')
const temperature_tests = require('./temperature.test.json')

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

  getDimension() {
    return 'temperature'
  }

  // map temperature word to the unit that will be put in the context
  getUnits() {
    return {
      'dollars': 'dollar', 
      'dollar': 'dollar',
      'pounds': 'pound',
      'pound': 'pound',
      'euros': 'euro', 
      'euro': 'euro',
    } 
  }

  getUnitWords() {
    return [
      { temperature: 'dollar', one: 'dollar', many: 'dollars' },
      { temperature: 'pound', one: 'pound', many: 'pounds' },
      { temperature: 'euro', one: 'euro', many: 'euros' },
    ]
  }

  convertTo(amount, fromUnits, toUnits) {
    const conversion = {
    "dollar": { "euro": 0.82, "pound": 0.71, },
    "euro": { "dollar": 1.22, "pound": 0.82, },
    "pound": { "dollar": 1.42, "euro": 1.16, },
    }
    return conversion[fromUnits][toUnits] * amount
  }
}

const api = new API()

let config = {
  name: 'temperature',
  operators: [
    "([dimension])",
    "([unit])",
    "((amount/1 || number/1) [amountOfDimension|] ([unit]))",
    "(([amount]) [unit])",
    "((dimension/1) [convertToUnits|in] (unit/1))",

    "(([number]) [degree])",
    // "([temperature])",
    // "([celcius])",
    // "([fahrenheit])",
    // TODO 20 dollars in euros and yen
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
      id: "dimension", 
      generatorp: ({context, g}) => context.amount ? `${g(context.amount)} ${g(context.unit)}` : context.word,
    },
    { id: "amount", },
    { 
      id: "degree", 
      words: [{ word: 'degrees', number: 'many' }],
      isA: ['amount'],
      generatorp: ({context, g}) => (context.amount) ? `${g(context.amount)} ${context.word}` : context.word,
      bridge: "{ ...next(operator), amount: before[0] }" 
    },
    { 
      id: "amountOfDimension", 
      convolution: true, 
      bridge: "{ marker: operator('dimension'), unit: after[0], amount: before[0] }" 
    },
    { 
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

    /*
    { 
      id: "temperature", 
      isA: ['dimension'],
      generatorp: ({context, g}) => context.amount ? `${g(context.amount)} ${g(context.unit)}` : context.word,
    },
    */
   
    /* 
    { 
      id: "fahrenheit", 
      isA: ['unit'],
    },
    { 
      id: "celcius", 
      isA: ['unit'],
    },
    */
  ]
};

config = new Config(config, module)
config.add(gdefaults).add(numbers).add(testing)
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
    name: './temperature.test.json',
    contents: temperature_tests
  },
})
