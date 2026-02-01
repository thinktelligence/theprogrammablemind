const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const hierarchy = require('./hierarchy.js')
const store_tests = require('./store.test.json')
const instance = require('./store.instance.json')

const template = {
  configs: [
  ],
}

knowledgeModule({ 
  config: { name: 'store' },
  includes: [hierarchy],

  module,
  description: 'The manages ordering from a store of some kind.',
  test: {
    name: './store.test.json',
    contents: store_tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
  instance,
  template: {
    template,
  }
})
