const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require('./dialogues')
const math = require('./math')
const ui_tests = require('./ui.test.json')
const ui_instance = require('./ui.instance.json')

class API {
  initialize({ objects }) {
    this._objects = objects
  }

  move(direction, steps = 1) {
    this._objects.move = { direction, steps }
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
const configStruct = {
  name: 'ui',
  operators: [
    "([select])",
    "([unselect])",
    "([cancel])",
    "([move] ([direction]))",
    "([down])",
    "([up])",
    "([left])",
    "([right])",
    "([stop] ([action]))",
    "([listening])",
    "(([direction]) [moveAmount|] ([number]))"
  ],
  semantics: [
    {
      where: where(),
      match: ({context, isA}) => isA(context, 'direction'),
      apply: ({context, insert, s, fragments}) => {
        const direction = context
        const fragment = fragments("move direction")
        const mappings = [{
          where: where(),
          match: ({context}) => context.value == 'direction',
          apply: ({context}) => Object.assign(context, direction),
        }]
        const instantiation = fragment.instantiate(mappings)
        s(instantiation)
      }
    },
  ],
  bridges: [
    { 
       where: where(),
       id: "select", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator) }",
       semantic: ({api, context}) => {
         api.select()
       }
    },
    { 
       where: where(),
       id: "unselect", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator) }",
       semantic: ({api, context}) => {
         api.unselect()
       }
    },
    { 
       where: where(),
       id: "moveAmount", 
       isA: ['preposition'],
       convolution: true,
       level: 0, 
       bridge: "{ ...before[0], postModifiers: ['steps'], steps: after[0] }",
    },
    { 
       where: where(),
       id: "cancel", 
       isA: ['verby'],
       level: 0, 
       words: ['close'],
       bridge: "{ ...next(operator) }",
       semantic: ({api, context}) => {
         api.cancel()
       }
    },
    { 
       where: where(),
       id: "stop", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), action: after[0] }",
       generatorp: ({context, g}) => `stop ${g(context.action)}`,
       semantic: ({api, context}) => {
         api.stop(context.action.value)
       }
    },
    { 
       where: where(),
       id: "move", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), direction: after[0] }",
       generatorp: ({context, g}) => `move ${g(context.direction)}`,
       semantic: ({api, context}) => {
         api.move(context.direction.value, context.direction.steps ? context.direction.steps.value : 1)
       }
    },
    { 
       id: "direction", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "up", 
       level: 0, 
       isA: ['direction'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "down", 
       level: 0, 
       isA: ['direction'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "left", 
       level: 0, 
       isA: ['direction'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "right", 
       level: 0, 
       isA: ['direction'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "action", 
       level: 0, 
       isA: ['action'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "listening", 
       level: 0, 
       isA: ['action'],
       bridge: "{ ...next(operator) }" 
    },
  ],
};

const template = {
  fragments: [
    "move direction",
  ],
}

const createConfig = async () => {
  const config = new Config(configStruct, module)
  config.stop_auto_rebuild()
  await config.add(dialogues, math)
  await config.setApi(new API())
  await config.restart_auto_rebuild()
  return config
}

// const config = createConfig()

knowledgeModule({ 
  module,
  description: 'Control a ui with speech',
  createConfig,
  test: {
    name: './ui.test.json',
    contents: ui_tests,
    checks: {
      objects: ['move', 'select', 'unselect', 'cancel', 'stop'],
      context: defaultContextCheck,
    },
  },
  template: {
    template,
    instance: ui_instance
  }
})
