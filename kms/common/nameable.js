const { knowledgeModule, where, debug } = require('./runtime').theprogrammablemind
const { defaultContextCheck, defaultContextCheckProperties } = require('./helpers')
const helpers = require('./helpers')
const englishHelpers = require('./english_helpers')
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
    context.namespaced ??= {}
    context.namespaced.stm ??= {}
    context.namespaced.stm.names ??= []
    context.namespaced.stm.names.push(name)
    this.args.config.addWord(name, { id: context.marker, initial: `{ value: "${name}", pullFromContext: true, nameable_named: true }` })
  }

  // used by mongo km
  get(type, name) {
    return this.args.kms.stm.api.mentions({ 
      context: type, 
      condition: (context) => {
        if (context.namespaced?.stm && context.namespaced.stm.names) {
          return context.namespaced.stm.names.includes(name)
        }
      }
    })
  }

  getNamesByType(type) {
    const contexts = this.args.kms.stm.api.getByType(type)
    const names = new Set()
    for (const context of contexts) {
      if (context.namespaced?.stm?.names) {
        for (const name of context.namespaced.stm.names) {
          names.add(name)
        }
      }
    }
    return [...names]
  }

  getNames(nameable) {
    return (nameable.namespaced?.stm && nameable.namespaced.stm.names) || []
  }

  setCurrent(name) {
    const context = this.objects.named[name]
    if (context) {
      this.args.km('stm').api.mentioned({ context })
    }
  }
}

function initializer({config}) {
  config.addArgs(({kms, mentioned}) => {
    return {
      mentioned: (args) => {
        mentioned(args)
        if (args.name) {
          kms.nameable.api.setName(args.context, args.name)
        }
      },
    }
  })
}
const config = {
  name: 'nameable',
  operators: [
    // "([call] ([nameable]) (name))",
    "([call|] ([nameable]) (!@<=endOfSentence)*)",
    "((nameable) [isCalled|is] (call) (!@<=endOfSentence)*)",
    { pattern: "([getNamesByType] (type))", scope: "testing" },
    { pattern: "([m1])", scope: "testing" },
  ],
  bridges: [
    {
      id: 'm1',
      isA: ['memorable', 'nameable'],
      scope: "testing",
    },
    {
      id: 'getNamesByType',
      scope: "testing",
      isA: ['verb'],
      bridge: "{ ...next(operator), type: after[0] }",
      semantic: async ({context, api}) => {
        context.response = api.getNamesByType(context.type.value).join(" ")
        context.isResponse = true
      }
    },
    {
      id: 'isCalled',
      before: ['verb'],
      bridge: [
        { "apply": true, "bridge": "{ ...after[0], isCalled: operator }", "set": "operator" },
        {
          "rewire": [
            { "from": 'before[0]', "to": 'after[0]' },
            { "from": 'after[1]', "to": 'after[1]' },
          ]
        },
        { "apply": true, "operator": "operator", "set": "context" },
        { "apply": true, bridge: "{ ...context, interpolate: [{ property: 'nameable' }, { property: 'isCalled' }, { property: 'operator' }, { property: 'name' }] }" },
      ],
    },
    {
      id: 'call',
      isA: ['verb'],
      words: englishHelpers.conjugateVerb('call'),
      bridge: `{ 
        ...next(operator), 
        nameable: after[0], 
        name: after[1:][0], 
        operator: operator, 
        interpolate: [ { property: 'operator' }, { property: 'nameable' }, { property: 'name' } ] }
      `,
      // generatorp: async ({context, g, gs}) => `call ${await g(context.nameable)} ${await gs(context.name)}`,
      semantic: async ({config, context, api, e, verbatim, g}) => {
        // TODO find report being referred to
        // debugger
        const nameable = (await e(context.nameable))?.evalue
        if (!nameable) {
          verbatim(`${await g(context.nameable)} is not known`)
          return
        }
        const name = context.name.map((n) => n.text).join(' ')
        // const name = context.name.text
        api.setName(nameable, name)
      },
      check: defaultContextCheckProperties(['nameable', 'name']),
    },
    { 
      id: 'nameable', 
      words: helpers.words('nameable'),
      children: ['thisitthat'],
    },
  ],
  associations: {
    positive: [
      { context: [['call', 0], ['that', 0]], choose: 0 },
    ],
  },
  semantics: [
    {
      where: where(),
      match: ({context}) => context.marker == 'mentions' && context.evaluate && context.args.context.nameable_named,
      apply: async ({callId, _continue, toList, context, kms, e, log, retry}) => {
        context.args.condition ??= () => true
        const oldCondition = context.args.condition
        const name = context.args.context.value
        context.args.condition = (context) => {
          if (!context.namespaced?.stm?.names?.includes(name)) {
            return
          }
          return oldCondition(context)
        }
        _continue()
      }
    },
  ],
}

knowledgeModule( { 
  config,
  api: () => new API(),
  includes: [stm],
  initializer,

  module,
  description: 'namable objects',
  test: {
    name: './nameable.test.json',
    contents: nameable_tests,
    checks: {
            context: [
              defaultContextCheck({ extra: ['pullFromContext'] }),
            ],
            objects: ['mentioned', { km: 'stm' }],
          },
    include: {
      words: [ "peter james chunkington", "banana" ],
    }
  },
})
