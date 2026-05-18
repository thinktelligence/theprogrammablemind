const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const tests = require('./control.test.json')

function initializer({config}) {
  config.addArgs((args) => ({
    callOnce: (args, condition) => {
      if (condition(args)) {
        const { context } = args

        if (!context.control) {
          context.control = {
            seen: [],
            nextId: 2,
          }
          context.control_id = 1
        }

        if (!context.control_id) {
          context.control_id = context.control.nextId
          context.control.nextId += 1
        }
        if (context.control.seen.includes(context.control_id)) {
          return false
        }
        context.control.seen.push(context.control_id)
        return true
      }
      return false
    }
  }))
}

knowledgeModule({
  config: { name: 'control' },
  initializer,
  module,
  description: 'Used for controlling calls',
  test: {
    name: './control.test.json',
    contents: tests,
  },
})
