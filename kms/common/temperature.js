const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const dimension = require('./dimension.js')
const temperature_tests = require('./temperature.test.json')
const temperature_instance = require('./temperature.instance.json')

const template = {
  "queries": [
    "temperature is a dimension",
    "celcius fahrenheit and kelvin are units of temperature",

    "fahrenheit = celcius*9/5 + 32",
    "celcius = (fahrenheit - 32)*5/8 + 32",
  ],
}

config = new Config({ name: 'temperature' }, module)
config.add(dimension)

knowledgeModule({ 
  module,
  description: 'Weight dimension',
  config,
  test: {
    name: './temperature.test.json',
    contents: temperature_tests
  },
  template: {
    template,
    instance: temperature_instance
  }
})
