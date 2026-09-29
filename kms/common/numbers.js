const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const numbers_tests = require('./numbers.test.json')
const instance = require('./numbers.instance.json')
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
    // "([round] ([roundable]) ([to|]) )",
    // { pattern: "([testNumber])", scope: 'testing' },
    "([number])",
    "([integer])",
  ],
  bridges: [
    /*
    { 
      id: "testNumber", 
      scope: 'testing',
    },
    */
    { 
      id: "number", 
      bridge: "{ isInstance: false, ...next(operator) }" 
    },
    { 
      id: "integer", 
      isA: ['number'],
      bridge: "{ isInstance: false, ...next(operator) }"
   },
  ],
  words: {
    "literals": {
      "one": [{"id": "integer", "initial": "{ value: 1, isInstance: true }" }],
      "ones": [{"id": "integer", "initial": "{ value: 1, integer: 'many', isInstance: true }" }],
      "two": [{"id": "integer", "initial": "{ value: 2 , isInstance: true}" }],
      "twos": [{"id": "integer", "initial": "{ value: 2 , integer: 'many', isInstance: true}" }],
      "three": [{"id": "integer", "initial": "{ value: 3, isInstance: true }" }],
      "threes": [{"id": "integer", "initial": "{ value: 3, integer: 'many', isInstance: true }" }],
      "four": [{"id": "integer", "initial": "{ value: 4, isInstance: true }" }],
      "fours": [{"id": "integer", "initial": "{ value: 4, integer: 'many', isInstance: true }" }],
      "five": [{"id": "integer", "initial": "{ value: 5, isInstance: true }" }],
      "fives": [{"id": "integer", "initial": "{ value: 5, integer: 'many', isInstance: true }" }],
      "six": [{"id": "integer", "initial": "{ value: 6, isInstance: true }" }],
      "sixes": [{"id": "integer", "initial": "{ value: 6, integer: 'many', isInstance: true }" }],
      "seven": [{"id": "integer", "initial": "{ value: 7, isInstance: true }" }],
      "sevens": [{"id": "integer", "initial": "{ value: 7, integer: 'many', isInstance: true }" }],
      "eight": [{"id": "integer", "initial": "{ value: 8, isInstance: true }" }],
      "eights": [{"id": "integer", "initial": "{ value: 8, integer: 'many', isInstance: true }" }],
      "nine": [{"id": "integer", "initial": "{ value: 9, isInstance: true }" }],
      "nines": [{"id": "integer", "initial": "{ value: 9, integer: 'many', isInstance: true }" }],
      "ten": [{"id": "integer", "initial": "{ value: 10, isInstance: true }" }],
      "tens": [{"id": "integer", "initial": "{ value: 10, integer: 'many', isInstance: true }" }],
      "pi": [{"id": "integer", "initial": { value: 3.1415926, integer: 'many', isInstance: true } }],
    },
    patterns: [
      { 
        pattern: [{ type: 'digit' }, { repeat: true }], 
        allow_partial_matches: false, 
        defs: [{id: "integer", uuid: '1', initial: "{ value: int(text), isInstance: true }" }]
      },
      { 
        pattern: [{ type: 'digit' }, { repeat: true }, '.', { type: 'digit' }, { repeat: true }], 
        allow_partial_matches: false, 
        defs: [{id: "number", uuid: '1', initial: "{ value: float(text), isInstance: true }" }]
      },
      { 
        pattern: ['.', { type: 'digit' }, { repeat: true }], 
        allow_partial_matches: false, 
        defs: [{id: "number", uuid: '1', initial: "{ value: float(text), isInstance: true }" }]
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
      match: ({context, isA}) => isA(context.marker, 'number', { extended: true }) && Number.isInteger(context.roundTo),
      apply: ({context}) => `${context.value.toFixed(context.roundTo)}`,
    },
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

const template = {
  fragments: [
    '10.2345', // used for unit tests
  ]
}

knowledgeModule( { 
  config,
  includes: [gdefaults, sdefaults],

  instance,
  template,

  module,
  description: 'talking about numbers',
  test: {
    name: './numbers.test.json',
    contents: numbers_tests,
    checks: {
      context: [
        defaultContextCheck({ marker: 'number', exported: true, extra: ['isInstance'] }),
        defaultContextCheck({ match: ({isA, context}) => isA(context.marker, 'integer'), exported: true, extra: ['isInstance'] }),
        defaultContextCheck()
      ],
    }
  },
})
