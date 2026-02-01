const { knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
ensureTestFile(module, 'wendy', 'test')
ensureTestFile(module, 'wendy', 'instance')

const kid = require('./kid')
const wendy_tests = require('./wendy.test.json')
const instance = require('./wendy.instance.json')

const template = {
  configs: [
    "you are wendy",
  ]
};

async function createConfig() {
  const config = new Config({ name: 'wendy', }, module)
  await config.add(kid)
  return config
}

knowledgeModule( {
  module,
  description: 'Kia Simulator using a KM template',
  createConfig,
  test: {
          name: './wendy.test.json',
          contents: wendy_tests,
        },
  instance,
  template: {
    template,
  },
})
