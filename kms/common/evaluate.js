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
  configs: [
     {
       operators: [
         "([evaluate] (value))",
       ],
       bridges: [
         {
           id: 'evaluate',
           bridge: "{ ...next(operator), value: after[1] ",
           semantic: ({context, e)}) => {
           }
         }
       ],
     },
  ]
};

const createConfig = async () => {
  return new Config({ name: 'evaluate' }, module)
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
