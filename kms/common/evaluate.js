const { knowledgeModule, ensureTestFile, where, unflatten, flattens } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const tests = require('./evaluate.test.json')
const pos = require('./pos')
const gdefaults = require('./gdefaults')

const config = {
  name: 'evaluate', 
  operators: [
    "([evaluate] (value))",
    { pattern: "([value1])", scope: "testing" },
  ],
  bridges: [
    {
      where: where(),
      id: 'value1',
      evaluator: ({context}) => {
        context.evalue = 'value1 after evaluation'
      },
      scope: "testing",
    },
    {
      where: where(),
      id: 'evaluate',
      after: ['verb'],
      bridge: "{ ...next(operator), postModifiers: ['value'], value: after[0] }",
      semantic: async ({context, e}) => {
        context.response = (await e(context.value)).evalue
        if (context.response) {
          context.isResponse = true
        }
      }
    }
  ],
};

knowledgeModule({ 
  config,
  includes: [pos, gdefaults],

  module,
  description: 'Explicit handling of evaluate',
  test: {
    name: './evaluate.test.json',
    contents: tests,
    include: {
      words: true,
    },
    checks: {
      context: [defaultContextCheck()],
    },
  },
})
