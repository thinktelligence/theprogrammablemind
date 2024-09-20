const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const helpers = require('./helpers')
const gdefaults = require('./gdefaults')
const listener_tests = require('./listener.test.json')

const configStruct = {
  name: 'listener',
  operators: [
    { pattern: "([call])", development: true },
  ],
  bridges: [
    {
      id: 'call',
      semantic: ({context}) => {
        context.wasCalled = true
      },
    },
  ],
  semantics: [
    { 
      match: ({context}) => context.marker == 'call',
      apply: ({context, defer}) => {
        defer(({context}) => {
          if (context.wasCalled) {
            context.sawWasCalled = true
          }
        })
      },
    },
  ],
}

let createConfig = async () => {
  const config = new Config(configStruct, module)
  config.stop_auto_rebuild()
  await config.add(gdefaults)
  await config.restart_auto_rebuild()
  return config
}

knowledgeModule( { 
  module,
  description: 'test of listeners',
  createConfig,
  test: {
    name: './listener.test.json',
    contents: listener_tests,
    checks: {
            context: defaultContextCheck,
            objects: ['mentioned', { km: 'gdefaults' }],
          },
  },
})
