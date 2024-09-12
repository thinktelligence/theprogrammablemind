const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const testing_tests = require('./testing.test.json')
const gdefaults = require('./gdefaults')

let configStruct = {
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

const createConfig = async () => {
  const config = new Config(configStruct, module)
  await config.add(gdefaults)
  return config
}

knowledgeModule({ 
  module,
  description: 'code for testing',
  createConfig,
  test: {
    name: './testing.test.json',
    contents: testing_tests
  },
})
