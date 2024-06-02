const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const words_tests = require('./words.test.json')

let configStruct = {
  name: 'words',
  operators: [
    "([adjective])",
    "([articlePOS])",
    "([prewordsition])",
    "([pronoun])",
    "([verby])",
    "([punctuation])",
  ],
  bridges: [
    { "id": "adjective" },
    { "id": "articlePOS" },
    { "id": "prewordsition" },
    { "id": "pronoun" },
    { "id": "verby" },
    { "id": "punctuation" },
  ],
  priorities: [
    { "choose": [['pronoun', 0], ['verby', 0], ], "choose": [0] },
    { "choose": [['prewordsition', 0], ['verby', 0], ], "choose": [0] },
    { "choose": [['adjective', 0], ['verby', 0], ], "choose": [0] },
    { "choose": [['articlePOS', 0], ['verby', 0], ], "choose": [0] },
    { "choose": [['punctuation', 0], ['verby', 0], ], "choose": [0] },
  ],

};

const createConfig = () => new Config(configStruct, module)

knowledgeModule( { 
  module,
  createConfig,
  description: 'evaluating to a word',
  test: {
    name: './words.test.json',
    contents: words_tests,
    checks: {
            context: defaultContextCheck,
          },
  },
})
