const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dimension = require('./dimension.js')
const temperature_tests = require('./temperature.test.json')
const temperature_instance = require('./temperature.instance.json')

const template = {
  configs: [
    "temperature is a dimension",
    "celcius fahrenheit and kelvin are units of temperature",

    "fahrenheit = celcius*9/5 + 32",
    "celcius = (fahrenheit - 32)*5/8 + 32",
  ],
}

knowledgeModule({ 
  config: { name: 'temperature' },
  includes: [dimension],

  module,
  description: 'Weight dimension',
  test: {
    name: './temperature.test.json',
    contents: temperature_tests,
    checks: {
            context: defaultContextCheck(),
          },
  },
  template: {
    template,
    instance: temperature_instance
  }
})
