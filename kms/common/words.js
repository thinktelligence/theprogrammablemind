const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const words_tests = require('./words.test.json')

const configStruct = {
  name: 'words',
  operators: [
    "([adjective])",
    "([article])",
    "([prewordsition])",
    "([pronoun])",
    "([verb])",
    "([punctuation])",
  ],
  bridges: [
    { "id": "adjective" },
    { "id": "article" },
    { "id": "prewordsition" },
    { "id": "pronoun" },
    { "id": "verb" },
    { "id": "punctuation" },
  ],
  priorities: [
    { "choose": [['pronoun', 0], ['verb', 0], ], "choose": [0] },
    { "choose": [['prewordsition', 0], ['verb', 0], ], "choose": [0] },
    { "choose": [['adjective', 0], ['verb', 0], ], "choose": [0] },
    { "choose": [['article', 0], ['verb', 0], ], "choose": [0] },
    { "choose": [['punctuation', 0], ['verb', 0], ], "choose": [0] },
  ],

};

async function createConfig() {
  return new Config(configStruct, module)
}

knowledgeModule( { 
  module,
  createConfig,
  description: 'evaluating to a word',
  test: {
    name: './words.test.json',
    contents: words_tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
})
