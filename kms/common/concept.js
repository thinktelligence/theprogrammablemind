const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { API }= require('./helpers/concept')
const concept_tests = require('./concept.test.json')
const concept_instance = require('./concept.instance.json')

const config = new Config({
  name: 'concept'
}, module)
config.api = new API()

knowledgeModule({ 
  module,
  description: 'The idea of a concept whatever that might end up being',
  config,
  test: {
    name: './concept.test.json',
    contents: concept_tests,
  }
})
