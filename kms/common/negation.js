const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { words, defaultContextCheck } = require('./helpers')
const gdefaults = require('./gdefaults')
const negation_tests = require('./negation.test.json')

let configStruct = {
  name: 'negation',
  operators: [
    "([not] ([negatable]))",
  ],
  bridges: [
    { 
      id: 'not', 
      bridge: '{ ...after[0], negated: operator, modifiers: append(["negated"], after[0].modifiers) }',
    },
    { id: 'negatable', words: words('negatable') },
  ],
};

const createConfig = () => new Config(configStruct, module).add(gdefaults())

knowledgeModule( {
  module,
  createConfig,
  description: 'negation',
  test: {
    name: './negation.test.json',
    contents: negation_tests,
    checks: {
      context: defaultContextCheck,
    },
  },
})

