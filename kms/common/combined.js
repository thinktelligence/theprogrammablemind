const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const length = require('./length.js')
const time = require('./time.js')
const tests = require('./combined.test.json')
const instance = require('./combined.instance.json')

const template = {
  configs: [
  ],
}

knowledgeModule({ 
  config: { name: 'combined' },
  includes: [length, time],

  module,
  description: 'Used for testing integrations',
  test: {
    name: './combined.test.json',
    contents: tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
  instance,
  template,
})
