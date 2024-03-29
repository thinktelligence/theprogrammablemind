const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const base_km = require('./hierarchy')
const countable = require('./countable')
const comparable = require('./comparable')
const tests = require('./formulasTemplate.test.json')
const instance = require('./formulasTemplate.instance.json')

const template = {
  queries: [
    "formulas are concepts",
  ] 
}

config = new Config({ name: 'formulasTemplate' }, module).add(base_km).add(countable).add(comparable)

knowledgeModule({ 
  module,
  description: 'Template for formulas',
  config,
  template: { template, instance },
  test: {
    name: './formulasTemplate.test.json',
    contents: tests
  },
})
