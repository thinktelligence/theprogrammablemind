const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const gdefaults = require('./gdefaults')
const punctuation_tests = require('./punctuation.test.json')

let configStruct = {
  name: 'punctuation',
  operators: [
    "([leftParenthesis|] (phrase) ([rightParenthesis|]))",
    "((before) [comma|])", // comma applies if before is dead
    "([colon|])",
    "([doubleQuote|] (!doubleQuote/*)* (doubleQuote/*))",
  ],
  bridges: [
    {
      id: "comma",
      level: 0,
      bridge: "{ ...before[0], decorators.after: operator, no_convolutions: true }",      // css :after decoration
      words: [{ word: ",", value: ',', depth: '+' }],
    },
    {
      id: "leftParenthesis",
      level: 0,
      bridge: "{ ...after[0], parenthesis: '(' }",
      words: [{ word: "(", value: '(', depth: '+' }],
    },
    {
      id: "rightParenthesis",
      level: 0,
      bridge: "{ ...next(operator) }",
      words: [{ word: ")", value: ')', depth: '-' }],
    },
    { id: "colon", words: [':'],  },
    {
      id: "doubleQuote",
      level: 0,
      bridge: "{ ...next(operator), quote: 'double' }",
      generatorp: ({context}) => context.text,
      words: [{ word: '"', depth: '+' }],
    },
  ],

  generators: [
    { 
      where: where(),
      priority: -1,
      match: ({context}) => context.parenthesis == '(',
      apply: async ({context, g}) => `(${await g({ ...context, parenthesis: null })})` 
    },
  ],
};

const createConfig = async () => new Config(configStruct, module).add(gdefaults)

knowledgeModule( {
  module,
  createConfig,
  description: 'punctuation',
  test: {
    name: './punctuation.test.json',
    contents: punctuation_tests,
    checks: {
            context: defaultContextCheck,
          },
  },
})

