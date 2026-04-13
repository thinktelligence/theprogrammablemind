const pluralize = require('pluralize')
const { defaultContextCheck, getValue, isMany } = require('./helpers')
const { debug, knowledgeModule, where, flatten } = require('./runtime').theprogrammablemind
const tokenize = require('./tokenize.js')
const words = require('./words.js')
const gdefaults_tests = require('./gdefaults.test.json')
const englishHelpers = require('./english_helpers.js')
const helpers = require('./helpers')

const config = {
  name: 'gdefaults',
  generators: [
  /* TODO save for later
    {
      where: where(),
      priority: -10,
      match: ({context, log}) => {
        if (!context.level) {
          log(`WARNING: Context for ${context.marker} is missing the level. ${JSON.stringify(context)}`)
        }
        return false
      },
    },
  */
    /*
     * modifiers = <list of properties>
     */
    {
      where: where(),
      match: ({context}) => context.isResponse && context.response,
      apply: ({context, gr}) => gr(context.response),
    },

    {
      where: where(),
      // match: ({context}) => context.paraphrase && context.interpolate,
      match: ({context}) => context.interpolate,
      apply: async ({interpolate, context}) => {
        return interpolate(context.interpolate, context)
      }
    },
    {
      where: where(),
      match: ({context}) => context.generate,
      apply: async ({context, gs}) => {
        const contexts = []
        for (const keyOrContext of (context.modifiers || []).concat(context.generate)) {
          let value = keyOrContext
          if (keyOrContext.invisible) {
            continue
          }
          if (typeof keyOrContext == 'string') {
            value = getValue(keyOrContext, context)
          }
          if (!(value !== undefined || keyOrContext == 'this')) {
            continue
          }
          if (value?.skipDefault) {
            continue
          }
          if (keyOrContext == 'this') {
            contexts.push({...context, generate: null})
          } else {
            if (Array.isArray(value)) {
              contexts.push(...value)
            } else {
              contexts.push(value)
            }
          }
        }
        return gs(contexts)
      }
    },

    {
      where: where(),
      // match: ({context}) => context.evalue && !context.paraphrase,
      match: ({context, callId}) => context.evalue && !context.paraphrase,
      // match: ({context}) => context.evalue && context.isResponse,
      apply: async ({context, g}) => await g(context.evalue)
    },

    {
      where: where(),
      //({context}) => context.paraphrase && context.modifiers,
      // match: ({context}) => context.paraphrase && (context.modifiers || context.postModifiers),
      match: ({context}) => (context.modifiers || context.postModifiers),
      apply: async ({context, g, gs, callId}) => {
        const text = []
        for (modifier of (context.modifiers || [])) {
          if (Array.isArray(context[modifier])) {
            for (const m of context[modifier]) {
              text.push(await g(m))
            }
          } else {
            text.push(await g(context[modifier], { assumed: { isModifier: true } }))
          }
        }
        // text.push(context.word)
        let number
        if (context.isModifier) {
          number = 'one'
        } else {
          number = isMany(context) ? 'many' : 'one'
        }
        if (context.postModifiers) {
          text.push(await g({...context, number: 'one', postModifiers: undefined, modifiers: undefined}))
        } else {
          text.push(await g({...context, number, postModifiers: undefined, modifiers: undefined}))
        }
        for ([index, modifier] of (context.postModifiers || []).entries()) {
          if (index == context.postModifiers.length - 1) {
            const fn = Array.isArray(context[modifier]) ? gs: g;
            if (Array.isArray(context[modifier])) {
              text.push(await gs(context[modifier].map((c) => { return {...c , number} })))
            } else {
              text.push(await g({...context[modifier], number}))
            }
          } else {
            const fn = Array.isArray(context[modifier]) ? gs: g;
            text.push(await fn(context[modifier]))
          }
        }
        return text.join(' ')
      }
    },

    { 
      where: where(),
      match: ({context}) => context.marker == 'unknown', 
      apply: ({context}) => {
        if (typeof context.marker === 'string' && context.value) {
          return context.value
        } else if (context.value) {
          return JSON.stringify(context.value)
        } else {
          return context.word
        }
      }
    },

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
      // match: ({context}) => context.evaluateWord && context.isVerb && context.paraphrase && context.word && context.number == 'one' && !context.imperative && !context.interpolate,
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

/*
    {
      where: where(),
      priority: -1,
      match: ({context}) => context.evaluateWord && context.isVerb && context.paraphrase && context.word && context.number == 'many' && !context.imperative && !context.interpolate,
      apply: ({context}) => {
        const infinitive = englishHelpers.getInfinitive(context.word)
        const cases = englishHelpers.conjugateVerb(infinitive)
        return pluralize.singular(context.word)
      },
    },
*/
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

    {
      where: where(),
      match: ({context}) => context.paraphrase && context.word && (context.number == 'many' || context.number > 1),
      apply: ({context}) => {
        // TODO make the sentence that the plural celcius is celcius work
        if (["fahrenheit", "celcius"].includes(context.word)) {
          return context.word
        }
        return pluralize.plural(context.word)
      }
    },

    {
      where: where(),
      // match: ({context}) => context.paraphrase && context.word && context.number == 'one',
      match: ({context}) => context.word !== null && context.number == 'one',
      apply: ({context}) => {
        return pluralize.singular(context.word)
      }
    },

    {
      where: where(),
      // match: ({context}) => context.paraphrase && context.word,
      // match: ({context}) => context.word && !context.value,
      //match: ({context}) => context.word && typeof context.value == 'string',
      match: ({context}) => (context.paraphrase || typeof context.value == 'string') && context.word,
      apply: ({context}) => `${context.word}` 
    },

    {
      where: where(),
      match: ({context}) => context.verbatim != null,
      apply: ({context}) => context.verbatim
    },

    {
      where: where(),
      match: ({context}) => context.value != null && Array.isArray(context.value),
      apply: async ({context, gs}) => await gs(context.value)
    },

    {
      where: where(),
      match: ({context}) => context.value != null,
      apply: async ({context, g, gr}) => g(context.value),
    },

    {
      where: where(),
      match: ({context}) => context.evalue != null,
      apply: ({context}) => `the ${context.word}` 
    },

    {
      where: where(),
      match: ({context}) => context.word != null,
      apply: ({context}) => context.word,
    },

    {
      where: where(),
      match: ({context}) => context.marker != null,
      apply: ({context}) => context.marker,
    },

    {
      where: where(),
      match: () => true,
      apply: ({context}) => JSON.stringify(context)
    }
  ],
};

function initializer({config}) {
    config.addArgs((args) => {
      function verbatim(text) {
        args.insert({ marker: 'verbatim', verbatim: text, isResponse: true })
      }
      return {
        flatten,
        number: (context) => isMany(context) ? "many" : "one",
        // number/gender/person etc
        gw: (context, { number: numberContext }) => {
          const number = numberContext ? args.number(numberContext) : context.number;
          return args.gp( { ...context, evaluateWord: true, number } )
        },
        verbatim, 
        say: verbatim,
        interpolate: async (interpolate, context) => {
          async function evaluator(key) {
            if (Array.isArray(context[key])) {
              return args.gsp(context[key])
            } else {
              return args.gp(context[key])
            }
          }
          function getValue(keyOrValue) {
            if (typeof keyOrValue == 'string' && context[keyOrValue]) {
              return context[keyOrValue]
            }
            return keyOrValue // it's a value
          }

          if (Array.isArray(interpolate)) {
            const strings = []
            let separator = ''
            const byPosition = []
            for (const element of interpolate) {
              // { "word": { "marker": "canPassive" } ie { word: <selectionCriteria> }
              if (element.word) {
                const word = args.getWordFromDictionary(element.word)
                if (word) {
                  strings.push(separator)
                  strings.push(await args.gp(word))
                  separator = ' '
                }
              } else if (typeof element == 'string') {
                separator = element
              } else if (element.separator && element.values) {
                let ctr = 0
                const values = getValue(element.values)
                const vstrings = []
                for (const value of values) {
                  if (ctr == values.length-1) {
                    vstrings.push(getValue(element.separator))
                  }
                  ctr += 1
                  vstrings.push(getValue(value))
                }
                strings.push(await args.gsp(vstrings))
              } else if (element.semantic) {
                const wordContext = {}
                for (const term of element.semantic) {
                  if (term.property) {
                    Object.assign(wordContext, context[term.property])
                  } else if (term.overrides) {
                    Object.assign(wordContext, term.overrides)
                  }
                }
                const value = await args.gp(wordContext) //, { options: { debug: { apply: true } } })
                if (value) {
                  strings.push(separator)
                  strings.push(await args.gp(value))
                  separator = ' '
                }
              } else if (element.property) {
                value = context[element.property]
                if (value) {
                  if (element.context) {
                    value = { ...value, ...element.context }
                  }
                  async function handleProperty(value) {
                    strings.push(separator)
                    if (Array.isArray(value)) {
                      strings.push(await args.gsp(value))
                    } else {
                      strings.push(await args.gp(value))
                    }
                    separator = ' '
                  }
                  if (element.byPosition) {
                    byPosition.push(((value) => () => handleProperty(value))(value))
                  } else {
                    await handleProperty(value)
                  }
                }
              } else if (element.context) {
                let value = element.context
                if (element.property) {
                  value = context[element.property]
                  if (element.context) {
                    Object.assign(value, element.context)
                  }
                }
                // if (!value?.number && element.number) {
                if (value?.form !== 'infinitive' && element.number) {
                  value.number = isMany(context[element.number]) ? "many": "one"
                }
                if (value) {
                  strings.push(separator)
                  strings.push(await args.gp(value))
                  separator = ' '
                }
              }
            }
            for (const bp of byPosition) {
              await bp()
            }
            return strings.join('')
          } else {
            return await helpers.processTemplateString(interpolate, evaluator)
          }
        }
      }
    })
  }

knowledgeModule({ 
  config,
  includes: [tokenize, words],
  initializer,

  module,
  description: 'defaults for generators',
  test: {
    name: './gdefaults.test.json',
    contents: gdefaults_tests,
    checks: {
      context: [defaultContextCheck()],
    },
  },
})
