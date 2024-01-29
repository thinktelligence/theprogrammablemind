const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const gdefaults = require('./gdefaults.js')
const math = require('./math.js')
const testing = require('./testing.js')
const formulas_tests = require('./formulas.test.json')

const template = {
  queries: [
    // { query: "x equals y + 4", development: true },
  ]
}

class API {
  initialize() {
  }
}

const api = new API()

let config = {
  name: 'formulas',
  operators: [
    "([formula])",
    "(([expression]) [equals] ([expression]))",
  ],
  bridges: [
    { 
      id: 'formula',
    },
    {
      id: 'expression',
    },
    {
      id: 'equals',
      words: ['='],
    },
  ]
};

config = new Config(config, module)
config.add(gdefaults).add(math).add(testing)
config.api = api

knowledgeModule({ 
  module,
  description: 'Formulas using math',
  config,
  test: {
    name: './formulas.test.json',
    contents: formulas_tests
  },
})
