const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const ordinals_tests = require('./ordinals.test.json')
const articles = require('./articles')
const numbers = require('./numbers')
const pos = require('./pos')

const config = {
  name: 'ordinals',
  operators: [
    "([ordinal])",
    "([orderable])",
    "((ordinal/*) [ordinalOnOrdered|] (orderable/*))",
  ],
  associations: {
    positive: [
      { context: [['article', 0], ['ordinal', 0]], choose: 1 },
    ]
  },
  bridges: [
    { 
      id: "ordinal", 
      isA: ["listable"],
      bridge: "{ instance: false, ordinal: true, ...next(operator) }" 
    },
    { 
      id: "orderable", 
      bridge: "{ ...next(operator) }",
      isA: ['queryable', 'theAble'],
    },
    { 
      id: "ordinalOnOrdered", 
      isA: ['adjective'],
      convolution: true,
      // bridge: "{ ...after[0], ordinal: before[0], modifiers: append(['ordinal'], after[0].modifiers), generate: append(['ordinal'], or(after[0].generate, after)) }" 
      bridge: "{ ...after[0], ordinal: before[0], modifiers: append(['ordinal'], after[0].modifiers) }" 
    },
  ],
  words: {
    "literals": {
      "first": [{"id": "ordinal", "initial": "{ value: 1, ordinal: true, instance: true }" }],
      "last": [{"id": "ordinal", "initial": "{ value: -1, ordinal: true, instance: true }" }],
      "1st": [{"id": "ordinal", "initial": "{ value: 1, ordinal: true, instance: true }" }],
      "second": [{"id": "ordinal", "initial": "{ value: 2, ordinal: true, instance: true }" }],
      "2nd": [{"id": "ordinal", "initial": "{ value: 2, ordinal: true, instance: true }" }],
      "third": [{"id": "ordinal", "initial": "{ value: 3, ordinal: true, instance: true }" }],
      "3rd": [{"id": "ordinal", "initial": "{ value: 3, ordinal: true, instance: true }" }],
    },
    patterns: [
      { "pattern": [{ type: 'digit' }, { repeat: true }, 'th'], defs: [{id: "ordinal", uuid: '1', initial: "{ value: int(substr(text, -2)), ordinal: true, instance: true }" }]},
      { "pattern": [{ type: 'digit' }, { repeat: true }, '1st'], defs: [{id: "ordinal", uuid: '1', initial: "{ value: int(substr(text, -2)), ordinal: true, instance: true }" }]},
      { "pattern": [{ type: 'digit' }, { repeat: true }, '2nd'], defs: [{id: "ordinal", uuid: '1', initial: "{ value: int(substr(text, -2)), ordinal: true, instance: true }" }]},
      { "pattern": [{ type: 'digit' }, { repeat: true }, '3rd'], defs: [{id: "ordinal", uuid: '1', initial: "{ value: int(substr(text, -2)), ordinal: true, instance: true }" }]},
    ],
  },
};

knowledgeModule( { 
  config,
  includes: [pos, numbers, articles],

  module,
  description: 'talking about ordinals',
  test: {
    name: './ordinals.test.json',
    contents: ordinals_tests,
    checks: {
            context: defaultContextCheck(),
          },

  },
})
