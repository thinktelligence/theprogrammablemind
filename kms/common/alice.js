const { knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
ensureTestFile(module, 'alice', 'test')
ensureTestFile(module, 'alice', 'instance')

const kid = require('./kid')
const alice_tests = require('./alice.test.json')
const alice_instance = require('./alice.instance.json')

const template = {
  configs: [
    "you are alice",
  ]
};

const createConfig = async () => {
  const config = new Config({ name: 'alice', }, module)
  await config.add(kid)
  return config
}

const config = createConfig()

// config.load(template, alice_instance)
knowledgeModule( {
  config: { name: 'alice', },
  includes: [kid],

  module,
  description: 'Kia Simulator using a KM template',
  config,
  test: {
          name: './alice.test.json',
          contents: alice_tests,
          checks: {
            context: defaultContextCheck(),
          },
        },
  template: {
    template,
    instance: alice_instance,
  },
})
