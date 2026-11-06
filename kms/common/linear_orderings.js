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
    "((linearlyOrdered/*) [linearOrderedRange|to] (linearlyOrdered/*))",
  ],
  bridges: [
    {
      id: "linearlyOrdered",
    }, 
    {
      id: "linearOrderedRange",
      before: ['preposition'],
      bridge: `{
        ...next(operator),
        types: [before[0].marker.id],
        operator: operator,
        from: before[0],
        to: after[0],
        interpolate: [{ property: 'from' }, { property: 'operator' }, { property: 'to' }]
      }`,
      check: defaultContextCheckProperties(['to', 'from', 'types'])
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
