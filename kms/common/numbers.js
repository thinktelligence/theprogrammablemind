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

let config = {
  name: 'numbers',
  operators: [
    "([number])",
  ],
  bridges: [
    { "id": "number", "level": 0, "bridge": "{ instance: false, ...next(operator) }" },
  ],
  debug: false,
  version: '3',
  words: {
    "literals": {
      "one": [{"id": "number", "initial": "{ value: 1, instance: true }" }],
      "ones": [{"id": "number", "initial": "{ value: 1, number: 'many', instance: true }" }],
      "two": [{"id": "number", "initial": "{ value: 2 , instance: true}" }],
      "twos": [{"id": "number", "initial": "{ value: 2 , number: 'many', instance: true}" }],
      "three": [{"id": "number", "initial": "{ value: 3, instance: true }" }],
      "threes": [{"id": "number", "initial": "{ value: 3, number: 'many', instance: true }" }],
      "four": [{"id": "number", "initial": "{ value: 4, instance: true }" }],
      "fours": [{"id": "number", "initial": "{ value: 4, number: 'many', instance: true }" }],
      "five": [{"id": "number", "initial": "{ value: 5, instance: true }" }],
      "fives": [{"id": "number", "initial": "{ value: 5, number: 'many', instance: true }" }],
      "six": [{"id": "number", "initial": "{ value: 6, instance: true }" }],
      "sixes": [{"id": "number", "initial": "{ value: 6, number: 'many', instance: true }" }],
      "seven": [{"id": "number", "initial": "{ value: 7, instance: true }" }],
      "sevens": [{"id": "number", "initial": "{ value: 7, number: 'many', instance: true }" }],
      "eight": [{"id": "number", "initial": "{ value: 8, instance: true }" }],
      "eights": [{"id": "number", "initial": "{ value: 8, number: 'many', instance: true }" }],
      "nine": [{"id": "number", "initial": "{ value: 9, instance: true }" }],
      "nines": [{"id": "number", "initial": "{ value: 9, number: 'many', instance: true }" }],
      "ten": [{"id": "number", "initial": "{ value: 10, instance: true }" }],
      "tens": [{"id": "number", "initial": "{ value: 10, number: 'many', instance: true }" }],
    },
    patterns: [
      { "pattern": [{ type: 'digit' }, { repeat: true }], defs: [{id: "number", uuid: '1', initial: "{ value: int(text), instance: true }" }]},
      { "pattern": [{ type: 'digit' }, { repeat: true }, '.', { type: 'digit' }, { repeat: true }], defs: [{id: "number", uuid: '1', initial: "{ value: float(text), instance: true }" }]},
      { "pattern": ['.', { type: 'digit' }, { repeat: true }], defs: [{id: "number", uuid: '1', initial: "{ value: float(text), instance: true }" }]},
    ],
  },

  hierarchy: [
    { child: 'number', parent: 'queryable', maybe: true },
    // { child: 'unknown', parent: 'number', maybe: true },
  ],

  generators: [
    { 
      where: where(),
      match: ({context}) => context.marker == 'number' && context.leadingZeros && context.value >= 0, 
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
      match: ({context}) => context.marker == 'number' && context.number == 'many', 
      apply: ({context}) => `${context.value}'s` 
    },
    { 
      where: where(),
      match: ({context}) => context.marker == 'number', 
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
    checks: {
            context: defaultContextCheck,
          },

  },
})
