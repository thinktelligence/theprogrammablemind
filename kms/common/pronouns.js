const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const pronouns_tests = require('./pronouns.test.json')
 
let config = {
  name: 'pronouns',

  operators: [
    "([self])",
  ],

  bridges: [
    { id: 'self', level: 0, bridge: "{ ...next(operator) }" },
  ],

  hierarchy: [
    ['self', 'queryable'],
  ],

  words: {
    "literals": {
      "my": [{ id: 'objectPrefix', initial: "{ variable: true, value: 'other', possessive: true }" }],
      "your": [{ id: 'objectPrefix', initial: "{ variable: true, value: 'self', possessive: true }" }],
      "you": [{ id: 'self', initial: "{ variable: true, value: 'self' }" }],
      "i": [{ id: 'self', initial: "{ variable: true, value: 'speaker' }" }],
    }
  },

  generators: [
    {
       where: where(),
       notes: "unknown answer default response for pronouns",
       match: ({context}) => context.marker == 'answerNotKnown',
       apply: ({context}) => `I don't know`,
    },
    {
       notes: 'paraphrase: add possession ending for your/my',
       priority: -1,
       where: where(),
       match: ({context}) => !context.isResponse && context.possessive && ['self', 'other'].includes(context.value),
       apply: ({context, g}) => { return { "self": "your", "other": "my" }[context.value] },
    },
    {
       notes: 'not paraphrase: add possession ending for your/my',
       priority: -1,
       where: where(),
       match: ({context}) => context.isResponse && context.possessive && ['self', 'other'].includes(context.value),
       apply: ({context, g}) => { return { "self": "my", "other": "your" }[context.value] },
    },
  ],

  semantics: [
    {
      notes: 'you are x',
      where: where(),
      match: ({context, listable}) => context.marker == 'self',
      apply: ({context, km}) => {
        km("dialogues").api.setVariable('self', context.same.value)
        context.sameWasProcessed = true
      }
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
            context: defaultContextCheck,
          },
  }
})
