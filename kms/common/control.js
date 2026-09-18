const { knowledgeModule, where, debug } = require('./runtime').theprogrammablemind
const tests = require('./control.test.json')

function initializer({config}) {
  config.addArgs((args) => ({
    callOnce: (args, tag, condition) => {
      if (condition(args)) {
        const { context } = args

        if (!context.control) {
          context.control = {
            seen: {},
          }
        }
        debugger
        if (context.control.seen[tag]) {
          return false
        }
        context.control.seen[tag] = true

        args._finally( () => {
          debug.counter("callOnce._finally")
          delete context.control.seen[tag]
        })

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
