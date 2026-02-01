const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dimension = require('./dimension.js')
const pressure_tests = require('./pressure.test.json')
const pressure_instance = require('./pressure.instance.json')

const template = {
  configs: [
    "pressure is a dimension",
    "pascals and atmospheres are units of pressure",

    "pascals = atmospheres * 101325",
    "atmospheres = pascals / 101325",
  ],
}

knowledgeModule({ 
  config: { name: 'pressure' },
  includes: [dimension],

  module,
  description: 'Pressure dimension',
  test: {
    name: './pressure.test.json',
    contents: pressure_tests,
    checks: {
      context: [defaultContextCheck()],
    },
  },
  instance: pressure_instance,
  template: {
    template,
  }
})
