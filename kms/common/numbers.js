const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const numbers_tests = require('./numbers.test.json')
const instance = require('./numbers.instance.json')
const gdefaults = require('./gdefaults')
const sdefaults = require('./sdefaults')
const linear_orderings = require('./linear_orderings')

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
    { 
      id: "number", 
      bridge: "{ isInstance: false, ...next(operator) }",
      isA: ['linearlyOrdered'],
    },
    { 
      id: "integer", 
      isA: ['number'],
      initial: { rangeableWith: ['number'] },
      bridge: "{ isInstance: false, ...next(operator) }"
   },
  ],
  words: {
    "literals": {
      "one": [{"id": "integer", "initial": "{ value: 1, isInstance: true, rangeableWith: ['number'] }" }],
      "ones": [{"id": "integer", "initial": "{ value: 1, integer: 'many', isInstance: true, rangeableWith: ['number'] }" }],
      "two": [{"id": "integer", "initial": "{ value: 2 , isInstance: true, rangeableWith: ['number'] }" }],
      "twos": [{"id": "integer", "initial": "{ value: 2 , integer: 'many', isInstance: true, rangeableWith: ['number'] }" }],
      "three": [{"id": "integer", "initial": "{ value: 3, isInstance: true, rangeableWith: ['number'] }" }],
      "threes": [{"id": "integer", "initial": "{ value: 3, integer: 'many', isInstance: true, rangeableWith: ['number'] }" }],
      "four": [{"id": "integer", "initial": "{ value: 4, isInstance: true, rangeableWith: ['number'] }" }],
      "fours": [{"id": "integer", "initial": "{ value: 4, integer: 'many', isInstance: true, rangeableWith: ['number'] }" }],
      "five": [{"id": "integer", "initial": "{ value: 5, isInstance: true, rangeableWith: ['number'] }" }],
      "fives": [{"id": "integer", "initial": "{ value: 5, integer: 'many', isInstance: true, rangeableWith: ['number'] }" }],
      "six": [{"id": "integer", "initial": "{ value: 6, isInstance: true, rangeableWith: ['number'] }" }],
      "sixes": [{"id": "integer", "initial": "{ value: 6, integer: 'many', isInstance: true, rangeableWith: ['number'] }" }],
      "seven": [{"id": "integer", "initial": "{ value: 7, isInstance: true, rangeableWith: ['number'] }" }],
      "sevens": [{"id": "integer", "initial": "{ value: 7, integer: 'many', isInstance: true, rangeableWith: ['number'] }" }],
      "eight": [{"id": "integer", "initial": "{ value: 8, isInstance: true, rangeableWith: ['number'] }" }],
      "eights": [{"id": "integer", "initial": "{ value: 8, integer: 'many', isInstance: true, rangeableWith: ['number'] }" }],
      "nine": [{"id": "integer", "initial": "{ value: 9, isInstance: true, rangeableWith: ['number'] }" }],
      "nines": [{"id": "integer", "initial": "{ value: 9, integer: 'many', isInstance: true, rangeableWith: ['number'] }" }],
      "ten": [{"id": "integer", "initial": "{ value: 10, isInstance: true, rangeableWith: ['number'] }" }],
      "tens": [{"id": "integer", "initial": "{ value: 10, integer: 'many', isInstance: true, rangeableWith: ['number'] }" }],
      "pi": [{"id": "integer", "initial": { value: 3.1415926, integer: 'many', isInstance: true, rangeableWith: ['number'] } }],
    },
    patterns: [
      { 
        pattern: [{ type: 'digit' }, { repeat: true }], 
        allow_partial_matches: false, 
        defs: [{id: "integer", uuid: '1', initial: "{ value: int(text), isInstance: true, rangeableWith: ['number'] }" }]
      },
      { 
        pattern: [{ type: 'digit' }, { repeat: true }, '.', { type: 'digit' }, { repeat: true }], 
        allow_partial_matches: false, 
        defs: [{id: "number", uuid: '1', initial: "{ value: float(text), isInstance: true, rangeableWith: ['number'] }" }]
      },
      { 
        pattern: ['.', { type: 'digit' }, { repeat: true }], 
        allow_partial_matches: false, 
        defs: [{id: "number", uuid: '1', initial: "{ value: float(text), isInstance: true, rangeableWith: ['number'] }" }]
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
    {
      where: where(),
      match: ({context, debug, isA}) => {
        return context.marker == 'unify' && 
               context.terms[0].marker == 'linearOrderedRange' && isA(context.terms[0].from, 'number') && isA(context.terms[0].to, 'number')
      },
      apply: ({context, debug, toEValue, resolveEvaluate}) => {
        debug.breakAt('time#call39')
        // resolveEvaluate(context, context.terms[0].value == context.terms[1].value)
        const { from, to } = context.terms[0]
        const number = context.terms[1]
        if (from.value <= toEValue(number) && toEValue(number) <= to.value) {
          resolveEvaluate(context, number)
        } else {
          resolveEvaluate(context, false)
        }
      }
    },
    {
      where: where(),
      match: ({context, debug, isA}) => context.marker == 'unify' && context.terms.every((term) => term.isInstance && isA(term, 'number')),
      apply: ({context, resolveEvaluate}) => {
        resolveEvaluate(context, context.terms[0].value == context.terms[1].value)
      }
    },
  ],
};

const template = {
  fragments: [
    '10.2345', // used for unit tests
  ]
}

knowledgeModule( { 
  config,
  includes: [linear_orderings, gdefaults, sdefaults],

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
