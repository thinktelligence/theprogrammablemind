const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck2 } = require('./helpers')
const helpers = require('./helpers')
const stm = require('./stm')
const nameable_tests = require('./nameable.test.json')

// TODO but "remember the m1\n call the m1 banana" <- the on the first one

class API {
  initialize({ objects, km, kms }) {
    this.objects = objects
    this.objects.named = {}
  }

  // report is a context
  setName(context, name) {
    if (!context.stm) {
      context.stm = {}
    }
    if (!context.stm.names) {
      context.stm.names = []
    }
    context.stm.names.push(name)
  }

  get(type, name) {
    return this.args.kms.stm.api.mentions({ 
      context: type, 
      condition: (context) => {
        if (context.stm && context.stm.names) {
          return context.stm.names.includes(name)
        }
      }
    })
  }

  getNamesByType(type) {
    const contexts = this.args.kms.stm.api.getByType(type)
    const names = new Set()
    for (const context of contexts) {
      if (context.stm.names) {
        for (const name of context.stm.names) {
          names.add(name)
        }
      }
    }
    return [...names]
  }

  getNames(nameable) {
    return (nameable.stm && nameable.stm.names) || []
  }

  /*
  getNames() {
    const current = this.current()
    console.log('getReportNames current', JSON.stringify(current, null, 2))
    return Object.keys(this.objects.namedReports).map( (name) => {
      const selected = (current.names || []).includes(name)
      return { name, selected, id: name }
    })
  }
  */

  setCurrent(name) {
    const context = this.objects.named[name]
    if (context) {
      this.args.km('stm').api.mentioned({ context })
    }
  }
}

const api = new API()

const config = {
  name: 'nameable',
  operators: [
    // "([call] ([nameable]) (name))",
    "([call] ([nameable]) (!@<=endOfSentence)*)",
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
      development: true,
    },
    {
      id: 'getNamesByType',
      development: true,
      isA: ['verb'],
      bridge: "{ ...next(operator), type: after[0] }",
      semantic: async ({context, api}) => {
        context.response = api.getNamesByType(context.type.value).join(" ")
        context.isResponse = true
      }
    },
    {
      id: 'call',
      isA: ['verb'],
      bridge: "{ ...next(operator), nameable: after[0], name: after[1:][0] }",
      // bridge: "{ ...next(operator), nameable: after[0], name: after[1] }",
      // generatorp: async ({context, g}) => `call ${await g(context.nameable)} ${await g(context.name)}`,
      generatorp: async ({context, g, gs}) => `call ${await g(context.nameable)} ${await gs(context.name)}`,
      semantic: async ({config, context, api, e}) => {
        // TODO find report being referred to
        const nameable = (await e(context.nameable)).evalue
        const name = context.name.map((n) => n.text).join(' ')
        // const name = context.name.text
        config.addWord(name, { id: nameable.marker, initial: `{ value: "${name}", pullFromContext: true, nameable_named: true }` })
        api.setName(nameable, name)
      }
    },
    { id: 'nameable', words: helpers.words('nameable')},
  ]
}

knowledgeModule( { 
  config,
  api: () => new API(),
  includes: [stm],

  module,
  description: 'namable objects',
  test: {
    name: './nameable.test.json',
    contents: nameable_tests,
    checks: {
            ...defaultContextCheck2(['pullFromContext']),
            objects: ['mentioned', { km: 'stm' }],
          },
    include: {
      words: [ "peter james chunkington", "banana" ],
    }
  },
})
