const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheckProperties, defaultContextCheck } = require('./helpers')
const dialogues = require("./dialogues")
const time = require("./time")
const tests = require('./actions.test.json')
const instance = require('./actions.instance.json')

/*
  do patrol 1 then patrol 2 then patrol 3
  do patrol 1 patrol 2 and then patrol 3
*/

const config = {
  name: 'actions',
  operators: [
    "([doAction|do] ([action]))",
    "((action) <again>)",
    "((action) [thenAction|then] (action))",
  ],
  bridges: [
    {
      id: 'action',
    },
    {
      id: "thenAction",
      level: 0,
      isA: ['action'],
      before: ['doAction'],
      selector: {
          left: [ { pattern: '(action))' } ],
          right: [ { pattern: '(action)' } ],
          passthrough: true
      },
      bridge: `{ 
        ...next(operator),
        operator: operator, 
        listable: true, 
        isList: true, 
        before: before, 
        after: after, 
        value: append(before, after)
      }`
    },
    {
      id: "thenAction",
      level: 1,
      before: ['doAction'],
      selector: {
          left: [ { pattern: '(action)' } ],
          passthrough: true
     },
      bridge: "{ ...next(operator), value: append(before, operator.value) }"
    },

    {
      id: 'again',
      bridge: `{
        ...before[0],
        action: before[0],
        again: operator,
        interpolate: [{ property: 'action' }, { property: 'again' }]
      }`
    },
    { 
      id: 'doAction', 
      isA: ['verb', 'repeatable'],
      check: defaultContextCheckProperties(['action']),
      bridge: `{
        ...next(operator),
        operator: operator,
        action: after[0],
        interpolate: [{ property: 'operator' }, { property: 'action' }]
      }`,
    },
  ],
  words: {
    patterns: [
      { "pattern": ["action", { type: 'digit' }], allow_partial_matches: false, defs: [{id: "action", initial: "{ value: text, instance: true }" }]},
    ],
  },
  semantics: [
    {
      priority: -1,
      match: ({context, isA}) => isA(context.marker, 'action'),
      apply: ({context, _continue, remember}) => {
        remember(context)
        _continue()
      }
    },
  ],
};

const template = {
  configs: [
    config,
  ],
}

knowledgeModule({ 
  config: { name: 'actions' },
  includes: [dialogues, time],
  instance,
  template,
  module,
  description: 'Actions using the word do',
  test: {
    name: './actions.test.json',
    contents: tests,
  },
})
