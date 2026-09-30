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
          if (key == 'context_id') {
            continue
          }
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
      if (context.word) {
        const word = { ...context }
        delete word.range
        objects.words = objects.words.filter((c) => JSON.stringify(c) !== JSON.stringify(word))
        objects.words.push(word)
      }
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
  template,
})
