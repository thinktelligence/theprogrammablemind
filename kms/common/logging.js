const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const tests = require('./logging.test.json')

class API {
  initialize({ objects }) {
    this.objects = objects
    this.objects.messages = []
  }
  
  async log(message) {
    if (this.args.isProcess || this.args.isTest) {
      if (typeof message == 'function') {
        message = await message()
      }
      this.objects.messages.push(message)
    }
  }
}

function initializer({config}) {
  config.addArgs(({kms, e, toList}) => ({
    testLog: (message) => {
      kms.logging.api.log(message)
    },
  }))
}

knowledgeModule({
  config: { name: 'logging' },
  initializer,
  api: () => new API(),
  module,
  description: 'Used for logging to help with testing',
  test: {
    name: './logging.test.json',
    contents: tests,
    checks: {
      objects: [
        { path: ['messages'] },
      ],
    }
  },
})
