const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const gdefaults = require('./gdefaults')
const yesno_tests = require('./yesno.test.json')

let configStruct = {
  name: 'yesno',
  operators: [
    "([yes])",
    "([no])",
    "((no/*) [cancel] ([cancellable]))",
  ],
  bridges: [
    { id: 'yes', words: [{ word: 'yep', value: 'yes' }] },
    { id: 'no', words: [{ word: 'nope', value: 'no' }] },
    { id: 'cancellable' },
    { 
      id: 'cancel',
      convolution: true,
      bridge: "{ ...operator, cancel: after[0], postModifiers: ['cancel'] }",
    },
  ],
};

const createConfig = () => new Config(configStruct, module).add(gdefaults())

knowledgeModule( {
  module,
  createConfig,
  description: 'yesno',
  test: {
    name: './yesno.test.json',
    contents: yesno_tests,
    checks: {
            context: defaultContextCheck,
    },
  },
})

