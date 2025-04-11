const { knowledgeModule, where, stableId } = require('./runtime').theprogrammablemind
const gdefaults = require('./gdefaults.js')
const pos = require('./pos.js')
const { defaultContextCheck } = require('./helpers')
const tests = require('./articles.test.json')

const config = {
  name: 'articles',
  operators: [
    "([thisitthat|])",
    "([it])",
    "([this])",
    "([that])",
    "([everything])",
    "([queryable])",
  /*
    "(<what> ([whatAble|]))",
    "([what:optional])",
  */
    "(<each> ([distributable]))",
    "(<every> ([distributable]))",
    "(<the|> ([theAble]))",
    "(<a|a,an> ([theAble|]))",
  ],
  bridges: [
    // { id: "what", level: 0, optional: "{ ...next(operator), query: ['what'], determined: true }", bridge: "{ ...after, query: ['what'], modifiers: ['what'], what: operator }" },
    // { id: "whatAble", level: 0, bridge: "{ ...next(operator) }" },
    {
      id: 'everything',
    },
    { 
      id: 'each', 
      isA: ['article'], 
      bridge: '{ ...after[0], focusableForPhrase: true, pullFromContext: true, concept: true, wantsValue: true, distributer: operator, modifiers: append(["distributer"], after[0].modifiers)}' 
    },
    { 
      id: 'every', 
      isA: ['article'], 
      bridge: '{ ...after[0], focusableForPhrase: true, pullFromContext: true, concept: true, wantsValue: true, distributer: operator, modifiers: append(["distributer"], after[0].modifiers)}' 
    },
    { 
      id: 'distributable', 
      isA: ['queryable'], 
    },
    { 
      id: 'the', 
      isA: ['article'], 
      level: 0, 
      bridge: '{ ...after[0], focusableForPhrase: true, pullFromContext: true, concept: true, wantsValue: true, determiner: "the", modifiers: append(["determiner"], after[0].modifiers)}' 
    },
    { 
      id: "a", 
      isA: ['article'], 
      level: 0, 
      // bridge: "{ ...after[0], pullFromContext: false, instance: true, concept: true, number: 'one', wantsValue: true, determiner: operator, modifiers: append(['determiner'], after[0].modifiers) }" 
      bridge: "{ ...after[0], pullFromContext: false, instance: true, concept: true, number: 'one', wantsValue: true, determiner: operator, modifiers: append(['determiner'], after[0].modifiers) }" 
    },
    { id: "queryable" },
    { 
      id: "theAble", 
      children: ['noun'],
      bridge: "{ ...next(operator) }" 
    },

    { 
      id: "thisitthat", 
      level: 0, 
      isA: ['queryable'], 
      before: ['verb'],
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "it", 
      level: 0, 
      isA: ['thisitthat'], 
      bridge: "{ ...next(operator), pullFromContext: true, unknown: true, determined: true }" 
    },
    { 
      id: "this", 
      level: 0, 
      isA: ['thisitthat'], 
      bridge: "{ ...next(operator), unknown: true, pullFromContext: true }" 
    },
    { 
      id: "that", 
      level: 0, 
      isA: ['thisitthat'], 
      bridge: "{ ...next(operator), unknown: true, pullFromContext: true }" 
    },
  ],
  words: {
    "literals": {
      "the": [{"id": "the", "initial": "{ modifiers: [] }" }],
    }
  },
  hierarchy: [
    ['it', 'pronoun'],
    ['this', 'pronoun'],
    // ['questionMark', 'isEd'],
    // ['a', 'article'],
    // ['the', 'article'],
    ['it', 'queryable'],
    // ['it', 'toAble'],
    ['this', 'queryable'],
  ],

};

knowledgeModule( { 
  config,
  includes: [pos, gdefaults],

  module,
  description: 'articles',
  newWay: true,
  test: {
    name: './articles.test.json',
    contents: tests,
    checks: {
            objects: ['onNevermindWasCalled', 'nevermindType', 'idSuffix'],
            context: defaultContextCheck(['distributer']),
          },

  },
})
