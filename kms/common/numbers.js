const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const numbers_tests = require('./numbers.test.json')
const gdefaults = require('./gdefaults')
const sdefaults = require('./sdefaults')

/*
  TODO 
    10 microns
    10 million 300 hundred and fifty
*/

const config = {
  name: 'numbers',
  operators: [
    "([number])",
    "([integer])",
  ],
  bridges: [
    { 
      id: "number", 
      bridge: "{ instance: false, ...next(operator) }" 
    },
    { 
      id: "integer", 
      isA: ['number'],
      bridge: "{ instance: false, ...next(operator) }"
   },
  ],
  words: {
    "literals": {
      "one": [{"id": "integer", "initial": "{ value: 1, instance: true }" }],
      "ones": [{"id": "integer", "initial": "{ value: 1, integer: 'many', instance: true }" }],
      "two": [{"id": "integer", "initial": "{ value: 2 , instance: true}" }],
      "twos": [{"id": "integer", "initial": "{ value: 2 , integer: 'many', instance: true}" }],
      "three": [{"id": "integer", "initial": "{ value: 3, instance: true }" }],
      "threes": [{"id": "integer", "initial": "{ value: 3, integer: 'many', instance: true }" }],
      "four": [{"id": "integer", "initial": "{ value: 4, instance: true }" }],
      "fours": [{"id": "integer", "initial": "{ value: 4, integer: 'many', instance: true }" }],
      "five": [{"id": "integer", "initial": "{ value: 5, instance: true }" }],
      "fives": [{"id": "integer", "initial": "{ value: 5, integer: 'many', instance: true }" }],
      "six": [{"id": "integer", "initial": "{ value: 6, instance: true }" }],
      "sixes": [{"id": "integer", "initial": "{ value: 6, integer: 'many', instance: true }" }],
      "seven": [{"id": "integer", "initial": "{ value: 7, instance: true }" }],
      "sevens": [{"id": "integer", "initial": "{ value: 7, integer: 'many', instance: true }" }],
      "eight": [{"id": "integer", "initial": "{ value: 8, instance: true }" }],
      "eights": [{"id": "integer", "initial": "{ value: 8, integer: 'many', instance: true }" }],
      "nine": [{"id": "integer", "initial": "{ value: 9, instance: true }" }],
      "nines": [{"id": "integer", "initial": "{ value: 9, integer: 'many', instance: true }" }],
      "ten": [{"id": "integer", "initial": "{ value: 10, instance: true }" }],
      "tens": [{"id": "integer", "initial": "{ value: 10, integer: 'many', instance: true }" }],
    },
    patterns: [
      { 
        pattern: [{ type: 'digit' }, { repeat: true }], 
        allow_partial_matches: false, 
        defs: [{id: "integer", uuid: '1', initial: "{ value: int(text), instance: true }" }]
      },
      { 
        pattern: [{ type: 'digit' }, { repeat: true }, '.', { type: 'digit' }, { repeat: true }], 
        allow_partial_matches: false, 
        defs: [{id: "number", uuid: '1', initial: "{ value: float(text), instance: true }" }]
      },
      { 
        pattern: ['.', { type: 'digit' }, { repeat: true }], 
        allow_partial_matches: false, 
        defs: [{id: "number", uuid: '1', initial: "{ value: float(text), instance: true }" }]
      },
    ],
  },

  hierarchy: [
    { child: 'number', parent: 'queryable', maybe: true },
    // { child: 'unknown', parent: 'number', maybe: true },
  ],

  generators: [
    { 
      where: where(),
      match: ({context, isA}) => isA(context.marker, 'number', { extended: true }) && context.leadingZeros && context.value >= 0, 
      apply: ({context}) => {
        value = `${context.value}` 
        if (value.length < context.length) {
          value = "0".repeat(context.length-value.length)+value
        }
        return value
      }
    },
    { 
      where: where(),
      match: ({context}) => ['number', 'integer'].includes(context.marker) && context.number == 'many', 
      apply: ({context}) => `${context.value}'s` 
    },
    { 
      where: where(),
      match: ({context}) => false && ['number', 'integer'].includes(context.marker),
      apply: ({context}) => `${context.value}` 
    },
  ],

  semantics: [
  ],
};

knowledgeModule( { 
  config,
  includes: [gdefaults, sdefaults],

  module,
  description: 'talking about numbers',
  test: {
    name: './numbers.test.json',
    contents: numbers_tests,
    checks: defaultContextCheck(['instance'])
  },
})
