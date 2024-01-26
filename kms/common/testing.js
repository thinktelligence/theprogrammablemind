const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const testing_tests = require('./testing.test.json')
const gdefaults = require('./gdefaults')

let config = {
  name: 'testing',
  operators: [
    { pattern: "([testingEvaluate] ([testingValue]))" },
    { pattern: "([testingValue])" },
  ],
  bridges: [
    {
      where: where(),
      id: 'testingEvaluate',
      generatorp: ({context, g}) => `${context.word} ${g(context.value)}`,
      semantic: ({context, e}) => {
        debugger
        context.evalue = e(context.value)
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

config = new Config(config, module)
config.add(gdefaults)

knowledgeModule({ 
  module,
  description: 'code for testing',
  config,
  test: {
    name: './testing.test.json',
    contents: testing_tests
  },
})
