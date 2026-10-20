const pluralize = require('pluralize')
const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const words_tests = require('./words.test.json')
const instance = require('./words.instance.json')
const tokenize = require('./tokenize')
const englishHelpers = require('./english_helpers.js')

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

    // number/gender/person etc

    gw: (context, { number: numberContext } = {}) => {
      const number = numberContext ? args.number(numberContext) : context.number;
      return args.gp( { ...context, evaluateWord: true, number } )
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

const config = { 
  name: 'words',
  generators: [
    { 
      where: where(),
      priority: -1,
      match: ({context}) => context.marker == 'modifies' && context.evaluateWord && context.paraphrase && context.number == 'one',
      apply: ({context}) => 'modifies'
    },  

    {     
      where: where(),
      priority: -1,
      match: ({context}) => context.marker == 'modifies' && context.evaluateWord && context.paraphrase && (context.number == 'many' || context.number > 1),
      apply: ({context}) => 'modify'
    },    
    
    {
      where: where(),
      priority: -1,
      match: ({context}) => context.evaluateWord && context.isVerb && context.paraphrase && context.word && !context.imperative && !context.interpolate,
      apply: ({context}) => {
        const infinitive = englishHelpers.getInfinitive(context.word)
        if (context.form == 'infinitive') {
          const cases = englishHelpers.conjugateVerb(infinitive)
          const def = cases.find((def) => def.form == context.form)
          return def.word
        } else if (context.tense) {
          const cases = englishHelpers.conjugateVerb(infinitive)
          const def = cases.find((def) => def.tense == context.tense)
          return def.word
        } else {
          return pluralize.plural(context.word)
        }
      },
    },

    {
      where: where(),
      priority: -1,
      match: ({context}) => context.evaluateWord && context.paraphrase && context.word && (context.number == 'many' || context.number > 1) && !context.interpolate,
      apply: ({context}) => pluralize.plural(context.word),
    },

    {
      where: where(),
      priority: -1,
      match: ({context}) => context.evaluateWord && context.isVerb && context.paraphrase && context.word && context.number == 'one' && !context.imperative && !context.interpolate,
      apply: ({context}) => {
        const infinitive = englishHelpers.getInfinitive(context.word)
        const cases = englishHelpers.conjugateVerb(infinitive)
        return pluralize.plural(context.word)
      },
    },

    {     
      where: where(),
      priority: -1,
      match: ({context}) => context.evaluateWord && context.paraphrase && context.word && context.number == 'one' && !context.interpolate,
      apply: ({context}) => {
        return pluralize.singular(context.word)
      },
    }, 
  ],
}

const template = {
  configs: [],
  fragments: [],
}

knowledgeModule( { 
  config,
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
