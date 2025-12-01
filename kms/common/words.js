const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const words_tests = require('./words.test.json')
const words_instance = require('./words.instance.json')
const tokenize = require('./tokenize')

function initializer({objects, config, isModule}) {
  config.addArgs(({config}) => ({
    getWords: (partial) => {
      debugger
    },
    addWord: (context) => {
      debugger
    }
  }))
}

const template = {
  configs: [],
  fragments: [],
}

knowledgeModule( { 
  config: { name: 'words' },
  includes: [tokenize],
  initializer,

  module,
  description: 'talking about words',
  test: {
    name: './words.test.json',
    contents: words_tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
  template: {
    template,
    instance: words_instance,
  },

})
