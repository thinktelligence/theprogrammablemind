const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const crew = require('./crew')
const kirk_tests = require('./kirk.test.json')
const kirk_instance = require('./kirk.instance.json')

const template = {
  configs: [
    "you are kirk",
  ]
};

// TODO what is your name
// TODO what is the name of you
// TODO crew members -> who are the crew members

kirk_instance.base = 'crew'

// config.load(template, kirk_instance)
knowledgeModule( {
  config: { name: 'kirk', },
  includes: [crew],

  module,
  description: 'Captain Kirk Simulator using a KM template',
  test: {
          name: './kirk.test.json',
          contents: kirk_tests,
          checks: {
            context: defaultContextCheck,
          },

        },
  template: {
    template,
    instance: kirk_instance,
  },
})
