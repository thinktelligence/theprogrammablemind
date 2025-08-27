const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const self_tests = require('./self.test.json')
 
const config = {
  name: 'self',

  operators: [
    "([self])",
  ],

  bridges: [
    { 
      id: 'self', 
      words: [
        { word: 'i', grammar_person: 1, grammer_case: 'nominative', number: 'one', },
        { word: 'my', grammar_person: 1, grammer_case: 'genitive' , number: 'one',},
        { word: 'me', grammar_person: 1, grammer_case: ['dative', 'accusative'], number: 'one', },
        { word: 'me', grammar_person: 1, grammer_case: 'accusative', number: 'one', },

        { word: 'you', grammar_person: 2, grammer_case: ['nominative', 'dative', 'accusative'], number: ['one', 'many'], },
        { word: 'your', grammar_person: 2, grammer_case: 'genitive', number: ['one', 'many'], },

        { word: 'he', grammar_person: 3, grammer_case: 'nominative', number: 'one', },
        { word: 'his', grammar_person: 3, grammer_case: 'genitive', number: 'one', },
        { word: 'him', grammar_person: 3, grammer_case: ['dative', 'accusative'], number: 'one', },

        { word: 'she', grammar_person: 3, grammer_case: 'nominative', number: 'one', },
        { word: 'her', grammar_person: 3, grammer_case: ['genitive', 'dative', 'accusative'], number: 'one', },
      ],

    },
  ],
};


knowledgeModule( { 
  config,

  module,
  description: 'self',
  test: {
    name: './self.test.json',
    contents: self_tests,
    checks: defaultContextCheck(),
  }
})
