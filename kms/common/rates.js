const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dimension = require('./dimension.js')
const rates_tests = require('./rates.test.json')
const rates_instance = require('./rates.instance.json')

const template = {
  configs: [
    {
      operators: [
        
      ],
    },
  ],
}

knowledgeModule({ 
  config: { name: 'rates' },
  includes: [dimension],

  module,
  description: 'Length dimension',
  test: {
    name: './rates.test.json',
    contents: rates_tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
  template: {
    template,
    instance: rates_instance
  }
})
