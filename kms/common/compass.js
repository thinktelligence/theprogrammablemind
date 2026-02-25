const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dimension = require('./dimension.js')
const compass_tests = require('./compass.test.json')
const instance = require('./compass.instance.json')

const template = {
  configs: [
    "compass modifies direction",
    "northwest, northeast, southwest and southeast are compass directions",
    "north, south, east and west are compass directions",
  ],
}

knowledgeModule({ 
  config: { name: 'compass' },
  includes: [dimension],

  module,
  description: 'Compass dimension',
  test: {
    name: './compass.test.json',
    contents: compass_tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
  instance,
  template,
})
