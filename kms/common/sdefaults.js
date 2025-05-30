const { flatten, knowledgeModule, where, debug } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
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
      notes: 'flatten',
      where: where(),
      priority: -1,
      // match: ({context}) => context.flatten || context.listable && context.value[0].flatten,
      match: ({context}) => context.flatten || context.listable && context.value.some((value) => value.flatten),
      // match: ({context}) => context.flatten || context.listable || (Array.isArray(context.value) && context.value.some((value) => value.flatten)),
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
        context.value = await e({ ...context, semanticIsEvaluate: false })
        context.isResponse
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

knowledgeModule({ 
  config,
  api: () => new API(),

  module,
  description: 'defaults for semantics',
  test: {
    name: './sdefaults.test.json',
    contents: sdefaults_tests,
    checks: {
      context: defaultContextCheck(),
    },
  },
})
