const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require('./dialogues')
const hierarchy = require('./hierarchy')
const emotions = require('./emotions')
const avatar_tests = require('./avatar.test.json')
 
const config = {
  name: 'avatar',

  // TODO make different response for answerNotKnown based on emotions
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
      // TODO use pronoun 
      "my": [{ id: 'objectPrefix', initial: "{ variable: true, value: 'other', possessive: true }" }],
      "your": [{ id: 'objectPrefix', initial: "{ variable: true, value: 'self', possessive: true }" }],
      "you": [{ id: 'self', initial: "{ variable: true, value: 'self' }" }],
      "i": [{ id: 'self', initial: "{ variable: true, value: 'speaker' }" }],
    }
  },

  generators: [
    {
       where: where(),
       notes: "unknown answer default response for avatar",
       match: ({context}) => context.marker == 'answerNotKnown',
       apply: ({context}) => `I don't know`,
    },
    {
       notes: 'paraphrase: add possession ending for your/my',
       priority: -1,
       where: where(),
       match: ({context}) => !(context.isResponse || context.audience == 'other' || context.responding) && context.possessive && ['self', 'other'].includes(context.value),
       apply: ({context, g}) => { return { "self": "your", "other": "my" }[context.value] },
    },
    {
       notes: 'not paraphrase: add possession ending for your/my',
       priority: -1,
       where: where(),
       match: ({context}) => (context.isResponse || context.audience == 'other' || context.responding) && context.possessive && ['self', 'other'].includes(context.value),
       apply: ({context, g}) => { return { "self": "my", "other": "your" }[context.value] },
    },
  ],

  semantics: [
    {
      notes: 'you are x',
      where: where(),
      match: ({context, listable}) => context.marker == 'self',
      apply: ({context, km}) => {
        km("stm").api.setVariable('self', context.same.value)
        context.sameWasProcessed = true
      }
    },
  ],

};

knowledgeModule( { 
  config,
  includes: [hierarchy, emotions],

  module,
  description: 'avatar for dialogues',
  test: {
    name: './avatar.test.json',
    contents: avatar_tests,
    checks: {
            context: defaultContextCheck(),
          },
  }
})
