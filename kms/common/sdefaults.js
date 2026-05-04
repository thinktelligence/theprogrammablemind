const { flatten, knowledgeModule, where, debug } = require('./runtime').theprogrammablemind
const { defaultContextCheck, concats, toEValue, toFinalValue } = require('./helpers')
const sdefaults_tests = require('./sdefaults.test.json')

class API {
  initialize(args) {
    const { globals } = args
    this.globals = globals
    this.globals.associations = []
  }

  addAssociation(association) {
    this.globals.associations.push(association)
  }
}

const config = {
  name: 'sdefaults',
  semantics: [
    {
      notes: 'flatten listable',
      where: where(),
      priority: -1,
      // match: ({context}) => context.flatten || context.listable && context.value[0].flatten,
      match: ({context}) => {
        if (debug.get('greg23') == 2) {
          debugger
        }
        if (context.contextIdProcessed) {
          if (context.contextIdProcessed.includes(context.contextId)) {
            return
          }
          context.contextIdProcessed.push(context.contextId)
        }
        return context.flatten || context.listable && context.value.some((value) => value.flatten)
      },
      // match: ({context}) => context.flatten || context.listable || (Array.isArray(context.value) && context.value.some((value) => value.flatten)),
      apply: async ({config, km, context, s, _continue}) => {
        const [flats, wf] = flatten(['list'], context)

        if (debug.get('greg23') == 2) {
          debugger
        }
        let contextIdCounter = 1
        const contextIdProcessed = []
        function setContextId(context) {
          if (!context.contextId) {
            context.contextId = contextIdCounter
            contextIdCounter += 1
          }
          if (!context.contextIdProcessed) {
            context.contextIdProcessed = contextIdProcessed
          }
        }
        const evalues = []
        for (const flat of flats) {
          setContextId(flat)
          debug.counter('greg23')
          debugger
          const result = await s(flat)
          if (result.evalue) {
            flat = result.evalue
            evalues.push(result.evalue)
          }
        }
        if (evalues.length > 0) {
          context.evalue = concats(evalues)
          context.isResponse = true
        }
        contextIdProcessed.length = 0
      }
    },
    {
      notes: 'flatten relation',
      where: where(),
      priority: -1,
      match: ({context}) => context.flatten && context.relation,
      apply: async ({config, km, context, s}) => {
        const [flats, wf] = flatten(['list'], context)
        for (const flat of flats) {
          await s({ ...flat, flatten: false })
        }
      }
    },
    {
      notes: 'semanticIsEvaluate',
      where: where(),
      priority: -1,
      match: ({context}) => context.semanticIsEvaluate,
      apply: async ({context, e}) => {
        context.evalue = await e({ ...context, semanticIsEvaluate: false })
        context.isResponse = true
      }
    },
    {
      notes: 'set the global associations',
      where: where(),
      priority: -1,
      match: ({context}) => context.marker == 'controlBetween' || context.marker == 'controlEnd',
      apply: async ({context, objects, api, _continue}) => {
        for (const association of context.previous?.associations || []) {
          api.addAssociation(association)
        }
        _continue()
      }
    },
  ],
};

function initializer({objects, config, isModule}) {
  config.addArgs(() => ({
    toFinalValue,
    toEValue,
  }))
}

knowledgeModule({ 
  config,
  initializer,
  api: () => new API(),

  module,
  description: 'defaults for semantics',
  test: {
    name: './sdefaults.test.json',
    contents: sdefaults_tests,
    checks: {
      context: [defaultContextCheck()],
    },
  },
})
