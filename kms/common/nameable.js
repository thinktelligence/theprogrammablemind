const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const helpers = require('./helpers')
const stm = require('./stm')
const nameable_tests = require('./nameable.test.json')

class API {
  initialize({ objects }) {
    this.objects = objects
    this.objects.named = {}
  }

  // report is a context
  setName(name, context) {
    this.objects.named[name] = context
    if (!report.nameable_names) {
      report.nameable_names = []
    }
    report.nameable_names.push(name)
  }

  get(name) {
    return this.objects.named[name]
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
      id: 'call',
      isA: ['verby'],
      bridge: "{ ...next(operator), nameable: after[0], name: after[1] }",
      generatorp: async ({context, g}) => `call ${await g(context.nameable)} ${await g(context.name)}`,
      evaluator: {
        match: ({context}) => context.nameable_named,
        apply: ({context, api}) => {
          context.evalue = api.get(context.value)
        }
      },
      semantic: async ({config, context, api, e}) => {
        // TODO find report being referred to
        const nameable = await e(context.nameable)
        const name = context.name.text
        config.addWord(name, { id: 'report', initial: `{ value: "${nameable.marker}", nameable_named: true }` })
        api.nameReport(report, name)
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
            objects: ['mentioned'],
          },
  },
})
