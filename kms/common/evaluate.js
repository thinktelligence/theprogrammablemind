const { Config, knowledgeModule, ensureTestFile, where, unflatten, flattens } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const tests = require('./evaluate.test.json')
const gdefaults = require('./gdefaults')

const configStruct = {
  name: 'evaluate', 
  operators: [
    "([evaluate] (value))",
    { pattern: "([value1])", development: true },
  ],
  bridges: [
    {
      id: 'value1',
      evaluator: ({context}) => {
        debugger
        context.evalue = 'value1 after evaluation'
      },
      development: true,
    },
    {
      id: 'evaluate',
      bridge: "{ ...next(operator), value: after[0] }",
      semantic: async ({context, e}) => {
        context.response = (await e(context.value)).evalue
        context.isResponse = true
      }
    }
  ],
};

const createConfig = async () => {
  const config = new Config(configStruct, module)
  config.stop_auto_rebuild()
  await config.add(gdefaults)
  await config.restart_auto_rebuild()
  return config
}

knowledgeModule({ 
  module,
  description: 'Explicit handling of evaluate',
  createConfig,
  test: {
    name: './evaluate.test.json',
    contents: tests,
    include: {
      words: true,
    },
    checks: {
      context: defaultContextCheck,
    },
  },
})
