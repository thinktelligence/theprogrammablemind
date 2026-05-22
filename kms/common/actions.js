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
    "([delayTime|in,after] (context.unit.dimension == 'time'))",
  ],
  bridges: [
    {
      id: 'delayTime',
      isA: ['preposition', 'action'],
      bridge: `{
        ...next(operator),
        operator: operator,
        delayTime: after[0],
        interpolate: [ { property: 'operator' }, { property: 'delayTime' } ]
      }`,
      check: defaultContextCheckProperties(['delayTime'])
    },
    {
      id: 'delayTime',
      where: where(),
      after: ['doAction'],
      level: 1,
      bridge: `{
        ...next(operator),
        operator: operator,
        checks: append(action.checks, ['action']),
        action: action,
        interpolate: [{ property: 'operator', byPosition: true }, { property: 'action', byPosition: true }]
      }`,
      selector: {
        // loose: "action",
        arguments: {
          action: "(@<= 'action' || @<= 'doAction')",
        },
      },
      semantic: async ({context, fragments, e, s, toFinalValue, kms}) => {
        const instantiation = await fragments("quantity in milliseconds", { quantity: context.delayTime })
        const result = await e(instantiation)
        const milliseconds = toFinalValue(toFinalValue(result).amount)
        await kms.time.api.sleep(milliseconds)
        await s(context.action)
      }
    },
    {
      id: 'action',
      // isA: ['thisitthat'],
    },
    {
      id: "thenAction",
      level: 0,
      isA: ['action'],
      before: ['doAction'],
      selector: {
          match: "same",
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
      bridge: "{ ...next(operator), value: append(before, operator.value) }",
      semantic: async ({context, toArray, s}) => {
        for (const action of toArray(context)) {
          await s(action)
        }
      },
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
        interpolate: append(default(operator.interpolate, [{ property: 'operator' }]), [{ property: 'action' }])
      }`,
      where: where(),
      semantic: async ({context, toArray, s}) => {
        for (const action of toArray(context.action)) {
          await s(action)
        }
      },
    },
  ],
  words: {
    patterns: [
      { "pattern": ["action", { type: 'digit' }], allow_partial_matches: false, defs: [{id: "action", initial: "{ value: text, instance: true, dead: true }" }]},
    ],
  },
  semantics: [
    {
      priority: -1,
      match: ({context, isA}) => !context.pullFromContext && (isA(context.marker, 'action') || context.marker == 'doAction'),
      apply: async ({context, _continue, testLog, g, remember}) => {
        remember(context)
        await testLog(() => g(context))
        _continue()
      }
    },
  ],
};

const template = {
  fragments: [ 
    "quantity in milliseconds",
  ],
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
    checks: {
      objects: [ { km: 'logging' } ],
    },
  },
})
