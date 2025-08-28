const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dimension = require('./dimension.js')
const length_tests = require('./length.test.json')
const length_instance = require('./length.instance.json')

const template = {
  configs: [
    "length is a dimension",
    "meter centimeter foot and inch are units of length",
    "meters = centimeters / 100",
    "centimeters = meters * 100",
    "centimeters = millimeters / 10",
    "millimeters = centimeters * 10",
    "millimeters = meters * 1000",
    "meters = millimeters / 1000",
    "feet = inches / 12",
    "inches = feet * 12",
    "meters = feet / 3.28",
    "miles = 5280 * feet",
    "feet = miles / 5280",
    "kilometers = meters / 1000",
    "meters = kilometers * 1000",
    // a mile is 5280 feet
    // 1 meter equals 3.28 feet
    // 1 meters equals 6.56
    // 1 foot equals 0.3048 meters
    // 1 foot + 2 feet ==> 3 feet
    // 1 foot + 2 meters in inches
    // 2 feet * 2 feet ==> 4 feet squared
    // account for currency which could be a call out
    // use frankenhash
    // 5'2"
    // 10cm 10 cm
    // 5C / 5 degrees C
  ],
}

knowledgeModule({ 
  config: { name: 'length' },
  includes: [dimension],

  module,
  description: 'Length dimension',
  test: {
    name: './length.test.json',
    contents: length_tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
  template: {
    template,
    instance: length_instance
  }
})
