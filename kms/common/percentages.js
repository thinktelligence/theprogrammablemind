const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const percentages_tests = require('./percentages.test.json')
const numbers = require('./numbers')

let configStruct = {
  name: 'percentages',
  operators: [
    "((number/*) [percent])",
    "((percent/1) [percentageOf|of] (number/*))",
  ],
  bridges: [
    { 
      id: "percent", 
      words: ['percent', '%'],
      bridge: "{ ...next(operator), modifiers: ['scale'], scale: before[0] }",
      generatorp: ({context}) => context.text,
    },
    { 
      id: "percentageOf", 
      words: ['percent', '%'],
      bridge: "{ ...next(operator), percentage: before[0], isResponse: true, semanticIsEvaluate: true, value: after[0] }",
      evaluator: async ({context, e}) => {
        const scale = context.percentage.scale
        const number = await e(context.value)
        const percentage = number.value * scale.value / 100
        const result = { ...number, value: percentage, word: null, text: null }
        context.evalue = result
        context.isReponse = true
        context.paraphrase = false
      },
      generatorp: ({context}) => context.text,
    },
  ],
  debug: false,
  version: '3',
};

const createConfig = async () => {
  const config = new Config(configStruct, module)
  await config.add(numbers)
  return config
}

knowledgeModule( { 
  module,
  createConfig,
  description: 'talking about percentages',
  test: {
    name: './percentages.test.json',
    contents: percentages_tests,
    checks: {
      context: [...defaultContextCheck, { property: 'scale', filter: ['marker', 'word', 'value'] }],
    },

  },
})
