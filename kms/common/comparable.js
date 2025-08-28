const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require("./dialogues")
const concept = require("./concept")
const numbers = require("./numbers")
const comparable_tests = require('./comparable.test.json')
const comparable_instance = require('./comparable.instance.json')


const config = {
  name: 'comparable',
  operators: [
    "([condition|])",
    "(([condition/*]) <compare|> ([comparable]))",
    "([highest])",
    "([lowest])",
    // "((comparable/*) <sortOrdering|>)",
  ],
  associations: {
    positive: [
      { context: [["article", 0], ["condition",0],["comparable",0]], choose: 2 },
      { context: [["article", 0], ["condition",0],["comparable",1]], choose: 2 },
    ]
  },
  bridges: [
    { 
      id: "compare", 
      convolution: true, 
      before: ['verb', 'article'],
      // bridge: "{ ...after, comparison: append(before[0], after[0].comparison), modifiers: append([before[0].marker], after[0].modifiers), [before[0].marker]: before[0] }" 
      // bridge: "{ ...after, comparison: append([], before[0].marker, after[0].comparison) }" 
      bridge: "{ ...next(before[0]), property: after, postModifiers: append([after[0].marker], before[0].modifiers), [after[0].marker.id]: after[0] }" 
      // bridge: "{ ...next(operator), property: after, postModifiers: append([after[0].marker], before[0].modifiers), [after[0].marker.id]: after[0] }" 
    },
    { 
      id: "condition", 
      children: ['highest', 'lowest'],
    },
    { 
      id: "comparable", 
      isA: ['theAble'],
    },
    { id: "lowest", },
    { id: "highest", },
  ],
};

const template = {
  configs: [
    "sort modifies ordering",
    "ascending is a sort ordering",
    "descending is a sort ordering",
    {
      operators: [
        "((comparable/*) [sortOrdering] (sort_ordering/*))",
      ],
      bridges: [
        {
          id: 'sortOrdering',
          convolution: true,
          isA: ['adjective'],
          localHierarchy: [['unknown', 'comparable']],
          bridge: "{ ...next(before[0]), ordering: after[0].value, sortOrder: after[0], postModifiers: append(['sortOrder'], before[0].postModifiers) }",
        },
      ],
    }
  ],
}

knowledgeModule({ 
  config,
  includes: [dialogues, numbers, concept],
  template: {
    template,
    instance: comparable_instance
  },

  module,
  description: 'Comparable things',
  test: {
    name: './comparable.test.json',
    contents: comparable_tests,
    checks: {
      context: [defaultContextCheck({ extra: ['ordering'] })],
    }
  },
})
