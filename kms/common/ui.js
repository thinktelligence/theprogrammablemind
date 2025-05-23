const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require('./dialogues')
const ordinals = require('./ordinals')
const countable = require('./countable')
const ui_tests = require('./ui.test.json')
const ui_instance = require('./ui.instance.json')

class API {
  initialize({ objects }) {
    this._objects = objects
  }

  move(direction, steps = 1, units = undefined) {
    this._objects.move = { direction, steps, units }
  }

  select(item) {
    this._objects.select = { item }
  }

  unselect(item) {
    this._objects.unselect = { item }
  }

  cancel(direction) {
    this._objects.cancel = true
  }

  stop(action) {
    this._objects.stop = action
  }
}

/*
  TODO

  select 2
  select twice
  again
  stop/start listening
*/
const config = {
  name: 'ui',
  operators: [
    "([select])",
    "([unselect])",
    "([cancel])",
    "([move] ([moveable])? ([direction]))",
    "([down])",
    "([up])",
    "([left])",
    "([right])",
    "([stop] ([action]))",
    "([listening])",
    "(([direction]) [moveAmount|] (number/* || quantity != null))"
    // "(([direction]) [moveAmount|] (number/* || context.quantity))"
    // "(([direction]) [moveAmount|] (number/*))"
  ],
  semantics: [
    {
      where: where(),
      match: ({context, isA}) => isA(context, 'direction'),
      apply: async ({context, insert, s, fragments}) => {
        const direction = context
        const fragment = fragments("move direction")
        const mappings = [{
          where: where(),
          match: ({context}) => context.value == 'direction',
          apply: ({context}) => Object.assign(context, direction),
        }]
        const instantiation = await fragment.instantiate(mappings)
        await s(instantiation)
      }
    },
  ],
  bridges: [
    { 
       where: where(),
       id: "select", 
       isA: ['verb'],
       semantic: ({api, context}) => {
         api.select()
       }
    },
    { 
       where: where(),
       id: "unselect", 
       isA: ['verb'],
       semantic: ({api, context}) => {
         api.unselect()
       }
    },
    { 
       where: where(),
       id: "moveAmount", 
       isA: ['preposition'],
       after: ['counting'],
       convolution: true,
       level: 0, 
       bridge: "{ ...before[0], postModifiers: ['steps'], steps: after[0] }",
    },
    { 
       where: where(),
       id: "cancel", 
       isA: ['verb'],
       words: ['close'],
       semantic: ({api, context}) => {
         api.cancel()
       }
    },
    { 
       where: where(),
       id: "stop", 
       isA: ['verb'],
       level: 0, 
       bridge: "{ ...next(operator), action: after[0] }",
       generatorp: async ({context, g}) => `stop ${await g(context.action)}`,
       semantic: ({api, context}) => {
         api.stop(context.action.value)
       }
    },
    { 
       where: where(),
       id: "move", 
       isA: ['verb'],
       level: 0, 
       localHierarchy: [['thisitthat', 'moveable']],
       optional: { 1: "{ marker: 'moveable', pullFromContext: true, default: true, skipDefault: true }" },
       bridge: "{ ...next(operator), operator: operator, moveable: after[0], direction: after[1], generate: ['operator', 'moveable', 'direction' ] }",
       semantic: ({api, context}) => {
         if (context.direction?.steps?.quantity) {
           api.move(context.direction.value, context.direction.steps.quantity.value, context.direction.steps.marker)
         } else {
           api.move(context.direction.value, context.direction.steps ? context.direction.steps.value : 1)
         }
       }
    },
    { id: "moveable", },
    { id: "direction", },
    { 
       id: "up", 
       isA: ['direction'],
    },
    { 
       id: "down", 
       isA: ['direction'],
    },
    { 
       id: "left", 
       isA: ['direction'],
    },
    { 
       id: "right", 
       isA: ['direction'],
    },
    { 
       id: "action", 
       isA: ['action'],
    },
    { 
       id: "listening", 
       isA: ['action'],
    },
  ],
};

const template = {
  fragments: [
    "move direction",
  ],
}

// const config = createConfig()

knowledgeModule({ 
  config,
  includes: [dialogues, ordinals, countable],
  api: () => new API(),

  module,
  description: 'Control a ui with speech',
  test: {
    name: './ui.test.json',
    contents: ui_tests,
    checks: {
      objects: ['move', 'select', 'unselect', 'cancel', 'stop'],
      context: defaultContextCheck(['operator', 'direction', 'moveable']),
    },
  },
  template: {
    template,
    instance: ui_instance
  }
})
