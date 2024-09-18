const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const helpers = require('./helpers')
const stm = require('./stm')
const nameable_tests = require('./nameable.test.json')

class API {
  initialize({ objects, km, kms }) {
    this.objects = objects
    this.objects.named = {}
  }

  // report is a context
  setName(context, name) {
    if (!context.nameable_names) {
      context.nameable_names = []
    }
    context.nameable_names.push(name)
  }

  get(name) {
    return this.objects.named[name]
  }

  getNamesByType(type) {
    debugger
    const contexts = this.args.kms.stm.api.getByType(type)
    const names = new Set()
    for (const context of contexts) {
      if (context.nameable_names) {
        for (const name of context.nameable_names) {
          names.add(name)
        }
      }
    }
    return [...names]
  }

  getNames() {
    const current = this.current()
    console.log('getReportNames current', JSON.stringify(current, null, 2))
    return Object.keys(this.objects.namedReports).map( (name) => {
      const selected = (current.names || []).includes(name)
      return { name, selected, id: name }
    })
  }

  setCurrent(name) {
    const context = this.objects.named[name]
    if (context) {
      this.args.km('stm').api.mentioned(context)
    }
  }
}

const api = new API()

const configStruct = {
  name: 'nameable',
  operators: [
    "([call] ([nameable]) (name))",
    { pattern: "([getNamesByType] (type))", development: true },
    { pattern: "([m1])", development: true },
//    { pattern: "([testPullFromContext] ([memorable]))", development: true }
  ],
  words: {
    literals: {
//      "m1": [{"id": "memorable", development: true, "initial": "{ value: 'm1' }" }],
//      "m2": [{"id": "memorable", development: true, "initial": "{ value: 'm2' }" }],
    },
  },
  bridges: [
    {
      id: 'm1',
      isA: ['memorable', 'nameable'],
    },
    {
      id: 'getNamesByType',
      development: true,
      isA: ['verby'],
      bridge: "{ ...next(operator), type: after[0] }",
      semantic: async ({context, api}) => {
        context.response = api.getNamesByType(context.type.value).join(" ")
        context.isResponse = true
      }
    },
    {
      id: 'call',
      isA: ['verby'],
      bridge: "{ ...next(operator), nameable: after[0], name: after[1] }",
      generatorp: async ({context, g}) => `call ${await g(context.nameable)} ${await g(context.name)}`,
      semantic: async ({config, context, api, e}) => {
        // TODO find report being referred to
        const nameable = (await e(context.nameable)).evalue
        const name = context.name.text
        config.addWord(name, { id: nameable.marker, initial: `{ value: "${nameable.marker}", nameable_named: true }` })
        api.setName(nameable, name)
      }
    },
    { id: 'nameable', words: helpers.words('nameable')},
  ]
}

let createConfig = async () => {
  const config = new Config(configStruct, module)
  config.stop_auto_rebuild()

  await config.initializer( ({config}) => {
    config.addArgs(({kms}) => ({
      mentioned: (context) => {
        kms.nameable.api.mentioned(context)
      },
      mentions: (context) => {
        return kms.nameable.api.mentions(context)
      },
    }))
  })
  await config.setApi(api)
  await config.add(stm)

  await config.restart_auto_rebuild()
  return config
}

knowledgeModule( { 
  module,
  description: 'namable objects',
  createConfig,
  test: {
    name: './nameable.test.json',
    contents: nameable_tests,
    checks: {
            context: [...defaultContextCheck, 'pullFromContext'],
            objects: ['mentioned', { km: 'stm' }],
          },
  },
})
