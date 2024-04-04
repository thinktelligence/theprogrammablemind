const { Config, knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
const dialogues = require('./dialogues')
const _ = require('lodash')
ensureTestFile(module, 'events', 'test')
const events_tests = require('./events.test.json')

class API {
  happens (context) {
    this.args.insert({ ...context, event: true, hidden: true, inserted: true })
  }

  happened(context, event) {
    return context.event && context.marker == event.marker
  }

  initialize() {
  }
}

let config = {
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
      generatorp: ({context, gp}) => `after ${gp(context.event)} ${gp(context.action)}`,
    },
    { id: "event", level: 0, bridge: "{ ...next(operator) }" },
    { id: "action", level: 0, bridge: "{ ...next(operator) }" },
    { id: "changeable", level: 0, bridge: "{ ...next(operator) }" },
    { 
      where: where(),
      id: "changes", 
      level: 0, 
      isA: ['verby#1'],
      bridge: "{ ...next(operator), changeable: before[0] }",
      generatorp: ({context, g}) => {
        if (!context.changeable) {
          return 'undefined changes'
        }
        return `${g(context.changeable)} changes`
      }
    },
    { id: "event1", level: 0, bridge: "{ ...next(operator) }", development: true },
    { id: "action1", level: 0, bridge: "{ ...next(operator) }", development: true },
  ],
  hierarchy: [
    { child: 'event1#1', parent: 'event#1', development: true },
    { child: 'action1#1', parent: 'action#1', development: true },
    ['changes#1', 'event#1'],
  ],
  generators: [
    {
      notes: 'paraphrase for events',
      where: where(),
      match: ({context, isA}) => isA(context.marker, 'event#1') && context.event,
      apply: ({context}) => `event happened: ${JSON.stringify(context)}`
    },
  ],
  semantics: [
    {
      notes: 'event1',
      development: true,
      where: where(),
      match: ({context}) => context.marker == 'event1#1' && !context.event,
      apply: ({context, kms}) => {
        kms.events.api.happens({ marker: 'event1#1' })
      }
    },
    {
      notes: 'action1',
      development: true,
      where: where(),
      match: ({context, isA}) => context.marker == 'action1#1',
      apply: ({context, kms}) => {
        context.verbatim = "Doing action1"
      }
    },
    {
      notes: 'after event action handler',
      where: where(),
      match: ({context}) => context.marker == 'after#1',
      apply: ({context, motivation}) => {
          // add motivation that watches for event
          const event = context.event
          const action = context.action
          motivation({
            repeat: true,
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

config = new Config(config, module)
config.api = new API()
config.add(dialogues)

knowledgeModule({ 
  module,
  name: 'events',
  description: 'do stuff after events',
  config,
  test: {
    name: './events.test.json',
    contents: events_tests,
    include: {
      words: true,
    }
  },
})
