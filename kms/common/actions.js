const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheckProperties, defaultContextCheck } = require('./helpers')
const dialogues = require("./dialogues")
const tests = require('./actions.test.json')
const instance = require('./actions.instance.json')

const config = {
  name: 'actions',
  operators: [
    "([doAction|do] ([action]))",
    "((action) <again>)",
  ],
  bridges: [
    {
      id: 'action',
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
      isA: ['verb'],
      check: defaultContextCheckProperties(['action']),
      bridge: `{
        ...next(operator),
        operator: operator,
        action: after[0],
        interpolate: [{ property: 'operator' }, { property: 'action' }]
      }`,
    },
  ],
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
  includes: [dialogues],
  instance,
  template,
  module,
  description: 'Actions using the word do',
  test: {
    name: './actions.test.json',
    contents: tests,
  },
})
