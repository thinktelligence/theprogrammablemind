const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck2 } = require('./helpers')
const crew = require('./crew')
const spock_tests = require('./spock.test.json')
const spock_instance = require('./spock.instance.json')

const template = {
  configs: [
    "you are spock",
  ]
};

spock_instance.base = 'crew'
// config.load(template, spock_instance)

knowledgeModule( {
  config: { name: 'spock', },
  includes: [crew],

  module,
  description: 'Spock Simulator using a KM template',
  test: {
          name: './spock.test.json',
          contents: spock_tests,
          checks: defaultContextCheck2(),
        },
  template: {
    template,
    instance: spock_instance,
  },
})
