const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const punctuation = require("./punctuation")
const pos_tests = require('./pos.test.json')

const config = {
  name: 'pos',
  operators: [
    "([adjective])",
    "([adverb])",
    "([article])",
    "([preposition])",
    "([pronoun])",
    "([verb])",
    "([subordinatedVerb])",
    "([ingVerb])",
    "([punctuation])",
    "([noun])",
  ],
  bridges: [
    {
      id: "adjective",
      before: ['ingVerb', 'subordinatedVerb', 'article', 'preposition'],
    },
    {
      id: "adverb",
      before: ['ingVerb', 'subordinatedVerb'],
    },
    {
      id: "article",
      before: ['ingVerb', 'subordinatedVerb', 'preposition'],
    },
    {
      id: "preposition",
      before: ['ingVerb', 'subordinatedVerb'],
    },
    {
      id: "pronoun",
    },
    {
      id: "verb",
      before: ['endOfSentence'],
    },
    {
      id: "subordinatedVerb",
      before: ['punctuation', 'verb'],
    },
    {
      id: "ingVerb",
      before: ['punctuation', 'verb'],
    },
    {
      id: "punctuation",
    },
    {
      id: "noun",
      before: ['ingVerb', 'subordinatedVerb'],
    },
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
      context: [defaultContextCheck()],
    },
  },
})
