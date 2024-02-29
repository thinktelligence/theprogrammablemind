const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const dimension = require('./dimension.js')
const pressure_tests = require('./pressure.test.json')
const pressure_instance = require('./pressure.instance.json')

const template = {
  "queries": [
    "pressure is a dimension",
    "pascals and atmospheres are units of pressure",

    "pascals = atmospheres * 101325",
    "atmospheres = pascals / 101325",
  ],
}

config = new Config({ name: 'pressure' }, module)
config.add(dimension)

knowledgeModule({ 
  module,
  description: 'Pressure dimension',
  config,
  test: {
    name: './pressure.test.json',
    contents: pressure_tests
  },
  template: {
    template,
    instance: pressure_instance
  }
})
