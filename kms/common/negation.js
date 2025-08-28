const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { words, defaultContextCheck } = require('./helpers')
const gdefaults = require('./gdefaults')
const pos = require('./pos')
const negation_tests = require('./negation.test.json')

const config = {
  name: 'negation',
  operators: [
    "([negatable])",
    "([not] (negatable/*))",
  ],
  associations: {
    positive: [
      { context: [["not",0],["unknown",0]], choose: 1 },
    ]
  },
  bridges: [
    { 
      id: 'not', 
      bridge: '{ ...after[0], negated: operator, modifiers: append(["negated"], after[0].modifiers) }',
      before: ['verb'],
      localHierarchy: [['unknown', 'negatable']],
    },
    { id: 'negatable', words: words('negatable') },
  ],
};

knowledgeModule( {
  config,
  includes: [gdefaults, pos],

  module,
  description: 'negation',
  test: {
    name: './negation.test.json',
    contents: negation_tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
})

