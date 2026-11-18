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
    "(value [linearOrderedRange|to] value)",
    // "([fromLO|from] (linearlyOrdered/*) (to/*) (linearlyOrdered/*))",
    // "at least (linearlyOrdered/*)",
    // "at most (linearlyOrdered/*)",
  ],
  bridges: [
    {
      id: "linearlyOrdered",
      initial: { rangeableWith: ['linearlyOrdered'] },
    }, 
    {
      id: "linearOrderedRange",
      // isA: ['number'],
      before: ['preposition'],
      selector: {
        match: "applicable",
        left: [ { pattern: '(@<= linearlyOrdered && @<=contexts[1].rangeableWith)' } ],
        right: [ { pattern: '(@<= linearlyOrdered && @<=contexts[-1].rangeableWith)' } ],
        passthrough: true
      },
      enhanced_associations: false,
      bridge: `{
        ...next(operator),
        localHierarchy: [before[0].marker.id],
        operator: operator,
        ...project(before[0], default(before[0].floaters, [])),
        from: before[0],
        to: after[0],
        interpolate: [{ property: 'from' }, { property: 'operator' }, { property: 'to' }]
      }`,
      check: defaultContextCheckProperties(['to', 'from', 'types'])
    },
  ],
  semantics: [
    {
      where: where(),
      match: ({context, debug}) => context.marker == 'unify' && context.terms[0].marker == 'linearOrderedRange',
      apply: async ({context, resolveEvaluate, compare, callId}) => {
        const { from, to } = context.terms[0]
        const value = context.terms[1]
        debugger
        const f = await compare(from, value)
        const t = await compare(value, to)
        if (f && t && f !== '>' && t !== '>') {
          resolveEvaluate(context, value)
        } else {
          resolveEvaluate(context, false)
        }
      }
    },
  ],
};

function initializer({objects, config, isModule}) {
  config.addArgs(
    ({e, toEValue}) => ({
      compare: async (left, right) => {
        const v = await e({ marker: 'linearlyOrderedCompare', left, right })
        return v.evalue
      }
    })
  )
}

knowledgeModule( { 
  config,
  includes: [pos, gdefaults, sdefaults],
  initializer,
  instance,
  module,
  description: 'talking about linear orderings',
  test: {
    name: './linear_orderings.test.json',
    contents: tests,
  },
})
