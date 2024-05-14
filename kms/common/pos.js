const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const pos_tests = require('./pos.test.json')

let configStruct = {
  name: 'pos',
  operators: [
    "([adjective])",
    "([articlePOS])",
    "([preposition])",
    "([pronoun])",
    "([verby])",
    "([punctuation])",
    "([noun])",
  ],
  bridges: [
    { "id": "adjective" },
    { "id": "articlePOS" },
    { "id": "preposition" },
    { "id": "pronoun" },
    { "id": "verby" },
    { "id": "punctuation" },
    { "id": "noun" },
  ],
  priorities: [
    [['verby', 0], ['pronoun', 0]],
    [['verby', 0], ['preposition', 0]],
    [['verby', 0], ['adjective', 0]],
    [['verby', 0], ['articlePOS', 0]],
    [['verby', 0], ['punctuation', 0]],
    [['verby', 0], ['noun', 0]],
  ],

};

createConfig = () => new Config(configStruct, module)

knowledgeModule( { 
  module,
  createConfig,
  description: 'parts of speech',
  test: {
    name: './pos.test.json',
    contents: pos_tests
  },
})
