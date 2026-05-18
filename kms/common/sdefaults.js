const { flatten, knowledgeModule, where, debug } = require('./runtime').theprogrammablemind
const { defaultContextCheck, concats, toEValue, toFinalValue } = require('./helpers')
const control = require('./control')
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

// TODO generalize this for avoiding recusive call without changing the context properties

const config = {
  name: 'sdefaults',
  semantics: [
    {
      notes: 'flatten listable',
      where: where(),
      priority: -1,
      // match: ({context}) => context.flatten || context.listable && context.value[0].flatten,
      // match: (args) => okay(args, ({context}) => (context.flatten || context.listable && context.value.some((value) => value.flatten))),
      match: (args) => args.callOnce(args, ({context}) => (context.flatten || context.listable && context.value.some((value) => value.flatten))),
      // match: ({context}) => context.flatten || context.listable || (Array.isArray(context.value) && context.value.some((value) => value.flatten)),
      apply: async ({config, km, context, s, _continue}) => {
        const [flats, wf] = flatten(['list'], context)
        const evalues = []
        for (const flat of flats) {
          if (!flat.control) {
            flat.control = context.control
          }
          const result = await s(flat)
          if (result.evalue) {
            evalues.push(result.evalue)
          }
        }
        if (evalues.length > 0) {
          context.evalue = concats(evalues)
          context.isResponse = true
        }
        context.control.seen.length = 0
      }
    },
    {
      notes: 'flatten relation',
      where: where(),
      priority: -1,
      // match: ({context}) => context.flatten && context.relation,
      match: (args) => args.callOnce(args, ({context}) => (context.flatten && context.relation)),
      apply: async ({config, km, context, s}) => {
        const [flats, wf] = flatten(['list'], context)
        for (const flat of flats) {
          if (!flat.control) {
            flat.control = context.control
          }
          await s(flat)
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
  includes: [control],
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
