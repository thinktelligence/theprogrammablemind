const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const punctuation = require("./punctuation")
const pos_tests = require('./pos.test.json')

let config = {
  name: 'pos',
  operators: [
    "([adjective])",
    "([adverb])",
    "([articlePOS])",
    "([preposition])",
    "([pronoun])",
    "([verb])",
    "([ingVerb])",
    "([punctuation])",
    "([noun])",
  ],
  bridges: [
    { "id": "adjective" },
    { "id": "adverb" },
    { "id": "articlePOS" },
    { "id": "preposition" },
    { "id": "pronoun" },
    { "id": "verb" },
    { "id": "ingVerb" },
    { "id": "punctuation" },
    { "id": "noun" },
  ],
  priorities: [
    { "context": [['verb', 0], ['ingVerb', 0], ], "choose": [1] },
    { "context": [['endOfSentence', 0], ['verb', 0], ], "choose": [1] },
    { "context": [['pronoun', 0], ['ingVerb', 0], ], "choose": [0] },
    { "context": [['preposition', 0], ['ingVerb', 0], ], "choose": [0] },
    { "context": [['adverb', 0], ['ingVerb', 0], ], "choose": [0] },
    { "context": [['preposition', 0], ['adjective', 0], ], "choose": [1] },
    { "context": [['preposition', 0], ['articlePOS', 0], ], "choose": [1] },
    { "context": [['adjective', 0], ['ingVerb', 0], ], "choose": [0] },
    { "context": [['articlePOS', 0], ['ingVerb', 0], ], "choose": [0] },
    { "context": [['articlePOS', 0], ['adjective', 0], ], "choose": [1] },
    { "context": [['punctuation', 0], ['ingVerb', 0], ], "choose": [1] },
    { "context": [['noun', 0], ['ingVerb', 0], ], "choose": [0] },
  ],

};

knowledgeModule( { 
  config,
  includes: [punctuation],

  module,
  description: 'parts of speech',
  test: {
    name: './pos.test.json',
    contents: pos_tests,
    checks: {
            context: defaultContextCheck(),
          },
  },
})
