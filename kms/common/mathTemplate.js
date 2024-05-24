const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const base_km = require('./hierarchy')
const countable = require('./countable')
const comparable = require('./comparable')
const tests = require('./mathTemplate.test.json')
const instance = require('./mathTemplate.instance.json')

const template = {
  queries: [
    "mathematical modifies operator",
    "* + / and - are mathematical operators",
  ] 
}

const createConfig = () => {
  return new Config({ name: 'mathTemplate' }, module).add(base_km()).add(countable()).add(comparable())
}

knowledgeModule({ 
  module,
  description: 'Template for math',
  createConfig,
  template: { template, instance },
  test: {
    name: './mathTemplate.test.json',
    contents: tests,
    checks: {
            context: defaultContextCheck,
          },
  },
})
