const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheckProperties } = require('./helpers')
const tests = require('./linear_orderings.test.json')
const instance = require('./linear_orderings.instance.json')
const pos = require('./pos')
const gdefaults = require('./gdefaults')
const sdefaults = require('./sdefaults')

const config = {
  name: 'linear_orderings',
  operators: [
    "([linearlyOrdered])",
    "((@<= linearlyOrdered && @<=contexts[1].rangeableWith) [linearOrderedRange|to] (@<= linearlyOrdered && @<=contexts[-1].rangeableWith))",
    // "([fromLO|from] (linearlyOrdered/*) (to/*) (linearlyOrdered/*))",
    // "at least (linearlyOrdered/*)",
    // "at most (linearlyOrdered/*)",
  ],
  bridges: [
    {
      id: "linearlyOrdered",
      initial: { rangeableWith: ['linearlyOrdered'] },
    }, 
    /*
    {
      id: "fromLO",
      isA: ['preposition'],
      bridge: `{
        ...next(operator),
        types: [before[0].marker.id],
        operator: operator,
        from: before[0],
        to: after[0],
        interpolate: [{ property: 'from' }, { property: 'operator' }, { property: 'to' }]
      }`
    }, 
    */
    {
      id: "linearOrderedRange",
      // isA: ['number'],
      before: ['preposition'],
      initial: { retries: 3 },
      bridge: `{
        ...next(operator),
        localHierarchy: [before[0].marker.id],
        operator: operator,
        from: before[0],
        to: after[0],
        interpolate: [{ property: 'from' }, { property: 'operator' }, { property: 'to' }]
      }`,
      check: defaultContextCheckProperties(['to', 'from', 'types'])
    },
  ],
  semantics: [
    {
      match: ({context, debug}) => context.marker == 'unify' && context.terms[0].marker == 'linearOrderedRange',
      apply: ({context, callId}) => {
        // debugger
      },
    },
  ],
};

knowledgeModule( { 
  config,
  includes: [pos, gdefaults, sdefaults],

  instance,

  module,
  description: 'talking about linear orderings',
  test: {
    name: './linear_orderings.test.json',
    contents: tests,
  },
})
