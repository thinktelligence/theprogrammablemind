const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { words, defaultContextCheck } = require('./helpers')
const gdefaults = require('./gdefaults')
const pos = require('./pos')
const negation_tests = require('./negation.test.json')

let configStruct = {
  name: 'negation',
  operators: [
    "([negatable])",
    "([not] (negatable/*))",
  ],
  bridges: [
    { 
      id: 'not', 
      bridge: '{ ...after[0], negated: operator, modifiers: append(["negated"], after[0].modifiers) }',
      before: ['verby'],
      localHierarchy: [['unknown', 'negatable']],
    },
    { id: 'negatable', words: words('negatable') },
  ],
};

const createConfig = async () => new Config(configStruct, module).add(gdefaults, pos)

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

