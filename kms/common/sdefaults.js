const { Config, flatten, knowledgeModule, where } = require('./runtime').theprogrammablemind
const sdefaults_tests = require('./sdefaults.test.json')

let configStruct = {
  name: 'sdefaults',
  semantics: [
    {
      notes: 'flatten',
      where: where(),
      priority: -1,
      match: ({context}) => context.flatten || context.listable && context.value[0].flatten,
      apply: ({config, km, context, s}) => {
        [flats, wf] = flatten(['list'], context)
        for (let flat of flats) {
          s({ ...flat, flatten: false })
        }
      }
    },
  ],
};

const createConfig = () => new Config(configStruct, module)

knowledgeModule({ 
  module,
  description: 'defaults for semantics',
  createConfig,
  test: {
    name: './sdefaults.test.json',
    contents: sdefaults_tests,
    checks: {
            context: [
              'marker',
              'text',
              { 'value': ['marker', 'text', 'value'] },
            ],
          },
  },
})
