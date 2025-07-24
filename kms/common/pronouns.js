const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const pronouns_tests = require('./pronouns.test.json')
 
const config = {
  name: 'pronouns',

  operators: [
    "([self])",
  ],

  // { marker: self, person: 1,2,3 case: nominative... }
  bridges: [
    { 
      id: 'self', 
      bridge: "{ ...next(operator) }",
      words: [
        { word: 'i', grammar_person: 1, grammer_case: 'nominative' },
        { word: 'my', grammar_person: 1, grammer_case: 'genitive' },
        { word: 'me', grammar_person: 1, grammer_case: 'dative' },
        { word: 'me', grammar_person: 1, grammer_case: 'accusative' },
      ],
    },
  ],
};


knowledgeModule( { 
  config,

  module,
  description: 'pronouns',
  test: {
    name: './pronouns.test.json',
    contents: pronouns_tests,
    checks: {
            context: defaultContextCheck(),
          },
  }
})
