const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const pos_tests = require('./pos.test.json')

let config = {
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
    { "context": [['pronoun', 0], ['verby', 0], ], "choose": [0] },
    { "context": [['preposition', 0], ['verby', 0], ], "choose": [0] },
    { "context": [['preposition', 0], ['adjective', 0], ], "choose": [1] },
    { "context": [['preposition', 0], ['articlePOS', 0], ], "choose": [1] },
    { "context": [['adjective', 0], ['verby', 0], ], "choose": [0] },
    { "context": [['articlePOS', 0], ['verby', 0], ], "choose": [0] },
    { "context": [['articlePOS', 0], ['adjective', 0], ], "choose": [1] },
    { "context": [['punctuation', 0], ['verby', 0], ], "choose": [1] },
    { "context": [['noun', 0], ['verby', 0], ], "choose": [0] },
  ],

};

knowledgeModule( { 
  config,

  module,
  description: 'parts of speech',
  test: {
    name: './pos.test.json',
    contents: pos_tests,
    checks: {
            context: defaultContextCheck,
          },
  },
})
