const { knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require('./dialogues')
const _ = require('lodash')
ensureTestFile(module, 'events', 'test')
const events_tests = require('./events.test.json')

class API {
  happens (insert, context) {
    insert({ ...context, event: true, hidden: true, inserted: true })
    // this.args.insert({ ...context, event: true, hidden: true, inserted: true })
  }

  happened(context, event) {
    return context.event && context.marker == event.marker
  }

  initialize() {
  }
}

const config = {
  name: 'events',
  operators: [
    "([after] ([event]) ([action]))",
    "(([changeable]) [changes])",
    { pattern: "([event1])", development: true },
    { pattern: "([action1])", development: true },
  ],
  bridges: [
    { 
      where: where(),
      id: "after", level: 0, 
      bridge: "{ ...next(operator), event: after[0], action: after[1] }",
      generatorp: async ({context, gp}) => `after ${await gp(context.event)} ${await gp(context.action)}`,
    },
    { id: "action", level: 0, bridge: "{ ...next(operator) }" },
    { id: "changeable", level: 0, bridge: "{ ...next(operator) }" },
    { 
      where: where(),
      id: "changes", 
      level: 0, 
      isA: ['verb'],
      bridge: "{ ...next(operator), changeable: before[0] }",
      generatorp: async ({context, g}) => {
        if (!context.changeable) {
          return 'undefined changes'
        }
        return `${await g(context.changeable)} changes`
      }
    },
    { 
      id: "event", 
      level: 0, 
      bridge: "{ ...next(operator) }",
      generators: [
        {
          notes: 'paraphrase for events',
          where: where(),
          match: ({context, isA}) => isA(context.marker, 'event') && context.event,
          apply: ({context}) => `event happened: ${context.marker}`
        }
      ]
    },
    { id: "event1", level: 0, bridge: "{ ...next(operator) }", development: true },
    { id: "action1", level: 0, bridge: "{ ...next(operator) }", development: true },
  ],
  hierarchy: [
    { child: 'event1', parent: 'event', development: true },
    { child: 'action1', parent: 'action', development: true },
    ['changes', 'event'],
  ],
  generators: [
    {
      notes: 'paraphrase for events',
      where: where(),
      match: ({context, isA}) => false && isA(context.marker, 'event') && context.event,
      apply: ({context}) => `event happened: ${JSON.stringify(context)}`
    },
  ],
  semantics: [
    {
      notes: 'event1',
      development: true,
      where: where(),
      match: ({context}) => context.marker == 'event1' && !context.event,
      apply: ({context, kms, insert}) => {
        kms.events.api.happens(insert, { marker: 'event1' })
      }
    },
    {
      notes: 'action1',
      development: true,
      where: where(),
      match: ({context, isA}) => context.marker == 'action1',
      apply: ({context, kms}) => {
        context.verbatim = "Doing action1"
      }
    },
    {
      notes: 'after event action handler',
      where: where(),
      match: ({context}) => context.marker == 'after',
      apply: ({context, config}) => {
          // add motivation that watches for event
          const event = context.event
          const action = context.action
          config.addSemantic({
            where: where(),
            match: ({context, kms}) => kms.events.api.happened(context, event),
            apply: ({context, insert}) => { 
              insert(action) 
            }
          })
      }
    },
  ],
};

knowledgeModule({ 
  config,
  api: () => new API(),
  includes: [dialogues],

  module,
  description: 'do stuff after events',
  test: {
    name: './events.test.json',
    contents: events_tests,
    include: {
      words: true,
    },
    checks: defaultContextCheck(['event', 'action']),
  },
})
