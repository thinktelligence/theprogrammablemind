const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const words_tests = require('./words.test.json')

let config = {
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
    [['verby', 0], ['pronoun', 0]],
    [['verby', 0], ['prewordsition', 0]],
    [['verby', 0], ['adjective', 0]],
    [['verby', 0], ['articlePOS', 0]],
    [['verby', 0], ['punctuation', 0]],
  ],

};

config = new Config(config, module)
knowledgeModule( { 
  module,
  config,
  description: 'evaluating to a word',
  test: {
    name: './words.test.json',
    contents: words_tests
  },
})
