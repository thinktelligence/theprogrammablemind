const { knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
ensureTestFile(module, 'wendy', 'test')
ensureTestFile(module, 'wendy', 'instance')

const kid = require('./kid')
const wendy_tests = require('./wendy.test.json')
const wendy_instance = require('./wendy.instance.json')

const template = {
  configs: [
    "you are wendy",
  ]
};

const createConfig = async () => {
  const config = new Config({ name: 'wendy', }, module)
  await config.add(kid)
  return config
}

// config.load(template, wendy_instance)
knowledgeModule( {
  module,
  description: 'Kia Simulator using a KM template',
  createConfig,
  test: {
          name: './wendy.test.json',
          contents: wendy_tests,
        },
  template: {
    template,
    instance: wendy_instance,
  },
})
