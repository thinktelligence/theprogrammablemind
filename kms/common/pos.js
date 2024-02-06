const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const pos_tests = require('./pos.test.json')

let config = {
  name: 'pos',
  operators: [
    "([adjective])",
    "([articlePOS])",
    "([preposition])",
    "([pronoun])",
    "([verby])",
  ],
  bridges: [
    { "id": "adjective" },
    { "id": "articlePOS" },
    { "id": "preposition" },
    { "id": "pronoun" },
    { "id": "verby" },
  ],
  priorities: [
    [['verby', 0], ['pronoun', 0]],
    [['verby', 0], ['preposition', 0]],
    [['verby', 0], ['adjective', 0]],
    [['verby', 0], ['articlePOS', 0]],
  ],

};
config = new Config(config, module)
knowledgeModule( { 
  module,
  config,
  description: 'parts of speech',
  test: {
    name: './pos.test.json',
    contents: pos_tests
  },
})
