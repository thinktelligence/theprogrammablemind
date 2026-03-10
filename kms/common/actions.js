const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheckProperties, defaultContextCheck } = require('./helpers')
const dialogues = require("./dialogues")
const tests = require('./actions.test.json')
const instance = require('./actions.instance.json')

const config = {
  name: 'actions',
  operators: [
    "([doAction|do] (action))",
  ],
  bridges: [
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
};

const template = {
  configs: [
    "actions are a concept",
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
