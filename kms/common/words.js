const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const words_tests = require('./words.test.json')
const instance = require('./words.instance.json')
const tokenize = require('./tokenize')

function initializer({objects, config, isModule}) {
  objects.words = []
  config.addArgs((args) => ({
    getWordFromDictionary: (partial) => {
      for (const word of objects.words) {
        let matches = true
        for (const key in partial) {
          if (partial[key] !== word[key]) {
            matches = false
          }
        }
        if (matches) {
          return word
        }
      }
    },
    addWordToDictionary: (context) => {
      objects.words.push(context)
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
  instance,
  template: {
    template,
  },

})
