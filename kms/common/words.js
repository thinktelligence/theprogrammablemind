const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const words_tests = require('./words.test.json')

const configStruct = {
  name: 'words',
  operators: [
    "([adjective])",
    "([articlePOS])",
    "([prewordsition])",
    "([pronoun])",
    "([verb])",
    "([punctuation])",
  ],
  bridges: [
    { "id": "adjective" },
    { "id": "articlePOS" },
    { "id": "prewordsition" },
    { "id": "pronoun" },
    { "id": "verb" },
    { "id": "punctuation" },
  ],
  priorities: [
    { "choose": [['pronoun', 0], ['verb', 0], ], "choose": [0] },
    { "choose": [['prewordsition', 0], ['verb', 0], ], "choose": [0] },
    { "choose": [['adjective', 0], ['verb', 0], ], "choose": [0] },
    { "choose": [['articlePOS', 0], ['verb', 0], ], "choose": [0] },
    { "choose": [['punctuation', 0], ['verb', 0], ], "choose": [0] },
  ],

};

const createConfig = async () => new Config(configStruct, module)

knowledgeModule( { 
  module,
  createConfig,
  description: 'evaluating to a word',
  test: {
    name: './words.test.json',
    contents: words_tests,
    checks: {
            context: defaultContextCheck(),
          },
  },
})
