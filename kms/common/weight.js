const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const dimension = require('./dimension.js')
const weight_tests = require('./weight.test.json')
const weight_instance = require('./weight.instance.json')

const template = {
  "queries": [
    "weight is a dimension",
    "kilograms grams pounds ounces and tons are units of weight",

    "kilograms = pounds * 0.453592",
    "grams = kilograms * 1000",
    "kilograms = grams / 1000",
    "pounds = kilograms * 2.20462",
    "ounces = pounds * 16",
    "ton = tonne * 0.907185",
    "pounds = ton * 2000",
  ],
}

config = new Config({ name: 'weight' }, module)
config.add(dimension)

knowledgeModule({ 
  module,
  description: 'Weight dimension',
  config,
  test: {
    name: './weight.test.json',
    contents: weight_tests
  },
  template: {
    template,
    instance: weight_instance
  }
})
