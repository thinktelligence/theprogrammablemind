const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const gdefaults = require('./gdefaults')
const punctuation_tests = require('./punctuation.test.json')

let config = {
  name: 'punctuation',
  operators: [
    "([leftParenthesis|] (phrase) ([rightParenthesis|]))",
  ],
  bridges: [
    {
      "id": "leftParenthesis",
      "level": 0,
      "bridge": "{ ...after[0], parenthesis: '(' }",
      "words": [{ word: "(", value: '(', depth: '+' }],
    },
    {
      "id": "rightParenthesis",
      "level": 0,
      "bridge": "{ ...next(operator) }",
      "words": [{ word: ")", value: ')', depth: '-' }],
    },
  ],

  generators: [
    { 
      where: where(),
      priority: -1,
      match: ({context}) => context.parenthesis == '(',
      apply: ({context, g}) => `(${g({ ...context, parenthesis: null })})` 
    },
  ],
};

config = new Config(config, module).add(gdefaults)

knowledgeModule( {
  module,
  config,
  description: 'punctuation',
  test: {
    name: './punctuation.test.json',
    contents: punctuation_tests
  },
})

