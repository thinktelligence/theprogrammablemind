const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const testing_tests = require('./testing.test.json')
const gdefaults = require('./gdefaults')

const config = {
  name: 'testing',
  operators: [
    { pattern: "([testingEvaluate] ([testingValue]))" },
    { pattern: "([testingValue])" },
  ],
  bridges: [
    {
      where: where(),
      id: 'testingEvaluate',
      generatorp: async ({context, g}) => `${context.word} ${await g(context.value)}`,
      semantic: async ({context, e}) => {
        context.evalue = await e(context.value)
        context.isResponse = true
      },
      bridge: "{ ...next(operator), value: after[0] }",
    },
    { 
      where: where(),
      id: 'testingValue',
      evaluator: ({context}) => {
        context.evalue = 'evaluated testingValue'
      }
    },
  ],
};

knowledgeModule({ 
  config,
  includes: [gdefaults],

  module,
  description: 'code for testing',
  test: {
    name: './testing.test.json',
    contents: testing_tests
  },
})
