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
      enhanced_associations: false,
      bridge: "{ ...next(operator), postModifiers: ['value'], value: after[0] }",
      semantic: async ({context, e, resolveEvaluate}) => {
        resolveEvaluate(context, (await e(context.value)).evalue)
      }
    }
  ],
};

function initializer({objects, config, isModule}) {
  config.addArgs(({config, api, toList, isA}) => ({
    resolveEvaluate: (context, value) => {
      if (Array.isArray(value)) {
        value = toList(value)
      }
      context.evalue = value || { marker: 'answerNotKnown' }
      if (context.evalue) {
        context.isResponse = true
      }
    },
  }))
}

knowledgeModule({ 
  config,
  initializer,
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
