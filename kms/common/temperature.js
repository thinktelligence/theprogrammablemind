const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const numbers = require('./numbers.js')
const temperature_tests = require('./temperature.test.json')

/*
  x celcius equals x*9/5 + 32 farenheight
  x farenheight equals (x-32)*5/9 + 32 farenheight
*/
class API {

  initialize() {
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
    "([temperature])",
    "([dimension])",
    "(([number]) [degree])",
    "(([amount]) [amountOfDimension|] ([dimension]))",
    "(([amount]) [dimension])",
    "([celcuis])",
    // "((temperature/1) [in] (temperature/0))",
    // TODO 20 dollars in euros and yen
  ],
  bridges: [
    { 
      id: "temperature", 
      level: 0, 
      generatorp: ({context, g}) => context.amount ? `${g(context.amount)} ${g(context.dimension)}` : context.word,
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "amount", 
      level: 0, 
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "degree", 
      words: [{ word: 'degrees', number: 'many' }],
      level: 0, 
      isA: ['amount'],
      generatorp: ({context, g}) => (context.amount) ? `${g(context.amount)} ${context.word}` : context.word,
      bridge: "{ ...next(operator), amount: before[0] }" 
    },
    { 
      id: "amountOfDimension", 
      level: 0, convolution: true, 
      bridge: "{ marker: operator('temperature'), dimension: after[0], amount: before[0] }" 
    },
    { 
      id: "dimension", 
      level: 0, 
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "celcuis", 
      level: 0, 
      isA: ['dimension'],
      generatorp: ({context}) => context.word,
      bridge: "{ ...next(operator) }" 
    },
  ]
};

config = new Config(config, module)
config.add(numbers)
config.api = api

knowledgeModule({ 
  module,
  description: 'Used to define numberic temperature such as currency, temperature or weight',
  config,
  test: {
    name: './temperature.test.json',
    contents: temperature_tests
  },
})
