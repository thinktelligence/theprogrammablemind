const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const gdefaults = require('./gdefaults')
const punctuation_tests = require('./punctuation.test.json')

let config = {
  name: 'punctuation',
  operators: [
    "([leftParenthesis|] (phrase) ([rightParenthesis|]))",
    "((before) [comma|])", // comma applies if before is dead
    "([colon|])",
    "((sentence) <endOfSentence|>)",
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
    { 
      id: "colon", 
      words: [':'],  
    },
    { 
      id: "endOfSentence", words: ['.'],  
      bridge: "{ ...before, postModifiers: append(before.postModifiers, ['endOfSentence']), endOfSentence: operator }",
    },
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

knowledgeModule( {
  config,
  includes: [gdefaults],

  module,
  description: 'punctuation',
  test: {
    name: './punctuation.test.json',
    contents: punctuation_tests,
    checks: {
            context: defaultContextCheck,
          },
  },
})

