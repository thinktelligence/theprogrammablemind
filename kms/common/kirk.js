const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const crew = require('./crew')
const kirk_tests = require('./kirk.test.json')
const kirk_instance = require('./kirk.instance.json')

const template = {
  "queries": [
    "you are kirk",
  ]
};

// TODO what is your name
// TODO what is the name of you
// TODO crew members -> who are the crew members

const createConfig = () => {
  const config = new Config({ name: 'kirk', }, module)
  config.add(crew())
  return config
}

kirk_instance.base = 'crew'
// config.load(template, kirk_instance)
knowledgeModule( {
  module,
  description: 'Captain Kirk Simulator using a KM template',
  createConfig,
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
