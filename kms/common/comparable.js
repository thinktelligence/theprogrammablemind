const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require("./dialogues")
const numbers = require("./numbers")
const comparable_tests = require('./comparable.test.json')

let config = {
  name: 'comparable',
  operators: [
    "([condition|])",
    "(([condition/1]) <compare|> ([comparable]))",
    "([highest])",
    "([lowest])",
    "((comparable/*) <ascending>)",
    "((comparable/*) <descending>)",
  ],
  bridges: [
    { 
      id: "compare", 
      convolution: true, 
      before: ['verb', 'articlePOS'],
      // bridge: "{ ...after, comparison: append(before[0], after[0].comparison), modifiers: append([before[0].marker], after[0].modifiers), [before[0].marker]: before[0] }" 
      // bridge: "{ ...after, comparison: append([], before[0].marker, after[0].comparison) }" 
      bridge: "{ ...next(before[0]), property: after, postModifiers: append([after[0].marker], before[0].modifiers), [after[0].marker.id]: after[0] }" 
      // bridge: "{ ...next(operator), property: after, postModifiers: append([after[0].marker], before[0].modifiers), [after[0].marker.id]: after[0] }" 
    },
    { 
      id: "condition", 
      children: ['highest', 'lowest'],
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "comparable", 
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "lowest", 
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "highest", 
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "ascending", 
      isA: ['adjective'],
      bridge: "{ ...next(before[0]), ordering: 'ascending', ascending: operator, postModifiers: append(['ascending'], before[0].postModifiers) }" 
    },
    { 
      id: "descending", 
      isA: ['adjective'],
      bridge: "{ ...next(before[0]), ordering: 'descending', descending: operator, postModifiers: append(['descending'], before[0].postModifiers) }" 
    },
  ],
};

knowledgeModule({ 
  config,
  includes: [dialogues, numbers],

  module,
  description: 'Comparable things',
  test: {
    name: './comparable.test.json',
    contents: comparable_tests,
    checks: {
      context: [...defaultContextCheck, 'ordering'],
    },
  },
})
