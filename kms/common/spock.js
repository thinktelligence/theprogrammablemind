const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const crew = require('./crew')
const spock_tests = require('./spock.test.json')
const instance = require('./spock.instance.json')

const template = {
  configs: [
    "you are spock",
  ]
};

instance.base = 'crew'

knowledgeModule( {
  config: { name: 'spock', },
  includes: [crew],

  module,
  description: 'Spock Simulator using a KM template',
  test: {
          name: './spock.test.json',
          contents: spock_tests,
          checks: {
            context: [defaultContextCheck()],
          },
        },
  instance,
  template: {
    template,
  },
})
