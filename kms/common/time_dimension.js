const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const dimension = require('./dimension.js')
const time_tests = require('./time_dimension.test.json')
const time_instance = require('./time_dimension.instance.json')

/*
  x y and z are english/metric units
  use english units
  ...
  troy and english ounces and pounds
  troy ounces english ounces and pounds
  troy and english ounces and ounces
  troy ounces and ounces

  troy ounce is an ounce
*/
const template = {
  "queries": [
    "years hours minutes and seconds are units of time",
    "hours = minutes / 60",
    "minutes = hours * 60",
    "seconds = minutes * 60",
    "minutes = seconds / 60",
    "day = hours / 24",
    "hours = days * 24",
  ],
}

config = new Config({ name: 'time_dimension' }, module)
config.add(dimension)

knowledgeModule({ 
  module,
  description: 'Time dimension',
  config,
  test: {
    name: './time_dimension.test.json',
    contents: time_tests
  },
  template: {
    template,
    instance: time_instance
  }
})
