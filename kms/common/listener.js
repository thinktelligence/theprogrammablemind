const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const helpers = require('./helpers')
const gdefaults = require('./gdefaults')
const listener_tests = require('./listener.test.json')

const config = {
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

knowledgeModule( { 
  config,
  includes: [gdefaults],

  module,
  description: 'test of listeners',
  test: {
    name: './listener.test.json',
    contents: listener_tests,
    checks: {
            context: defaultContextCheck,
            objects: ['mentioned', { km: 'gdefaults' }],
          },
  },
})
