const { Config, knowledgeModule, ensureTestFile, where, unflatten, flattens } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const _ = require('lodash')
ensureTestFile(module, 'meta', 'test')
ensureTestFile(module, 'meta', 'instance')
const meta_tests = require('./meta.test.json')
const meta_instance = require('./meta.instance.json')
const { hashIndexesGet, hashIndexesSet, translationMapping, translationMappings } = require('./helpers/meta.js')
const { zip, words } = require('./helpers.js')

const template = {
    queries: [
//      "if f then g",
      //"if e or f then g",
    ]
};

// TODO -> if a car's top speed is over 200 mph then the car is fast
let configStruct = {
  name: 'evaluate',
  bridges: [
    {
      id: "synonym",
      // implicit words in singular/plural
      words: words('synonym'),
      operator: "([synonym])",
    },
  ],
};

const createConfig = () => {
  return new Config(configStruct, module)
}

knowledgeModule({ 
  module,
  description: 'Explicit handling of evaluate',
  createConfig,
  test: {
    name: './meta.test.json',
    contents: meta_tests,
    include: {
      words: true,
    },
    checks: {
            context: defaultContextCheck,
          },

  },
  template: {
    template,
    instance: meta_instance,
  },
})
