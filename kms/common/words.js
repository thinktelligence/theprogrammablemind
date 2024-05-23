const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
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
    [['pronoun', 0], ['verby', 0], ],
    [['prewordsition', 0], ['verby', 0], ],
    [['adjective', 0], ['verby', 0], ],
    [['articlePOS', 0], ['verby', 0], ],
    [['punctuation', 0], ['verby', 0], ],
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
            context: [
              'marker',
              'text',
              { 'value': ['marker', 'text', 'value'] },
            ],
          },
  },
})
