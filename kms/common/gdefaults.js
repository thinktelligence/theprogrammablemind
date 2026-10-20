const pluralize = require('pluralize')
const { interpolate } = require('./helpers/gdefaults')
const { defaultContextCheck, getValue, isMany } = require('./helpers')
const { debug, knowledgeModule, where, flatten } = require('./runtime').theprogrammablemind
const tokenize = require('./tokenize.js')
const debugKM = require('./debug.js')
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
      match: ({context}) => context.isResponse && context.evalue,
      apply: ({context, gr}) => gr(context.evalue),
    },

    {
      where: where(),
      // match: ({context}) => context.paraphrase && context.interpolate,
      match: ({context}) => context.interpolate,
      apply: async (args) => {
        const {debug, context} = args
        return interpolate(args)(context.interpolate, context)
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
      match: ({context, callId}) => context.evalue && !context.paraphrase,
      apply: async ({context, g}) => await g(context.evalue)
    },

    {
      where: where(),
      //({context}) => context.paraphrase && context.modifiers,
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
              text.push(await gs(context[modifier].map((c) => { return {...c , number} }), { isModifier: true }))
            } else {
              text.push(await g({...context[modifier], number}, { isModifier: true }))
            }
          } else {
            const fn = Array.isArray(context[modifier]) ? gs: g;
            text.push(await fn({ ...context[modifier], isModifier: true }))
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
      match: ({context}) => context.paraphrase && context.word && (context.number == 'many' || context.number > 1) && !context.isModifier,
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
      match: ({context}) => !!context.word && context.number == 'one',
      apply: ({context}) => {
        return pluralize.singular(context.word)
      }
    },

    {
      where: where(),
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
      match: ({context, namespaced}) => context.marker == 'labelledValue' && context.useColon,
      apply: async ({context, g, debug, callId, gp}) => `${await gp(context.label)}: ${await g(context.value, { assumed: { brief: true } })}`
    },

    {
      where: where(),
      match: ({context, namespaced}) => context.marker == 'labelledValue',
      apply: async ({context, g, debug, callId, gp}) => `${await gp(context.label)} is ${await g(context.value, { assumed: { brief: true } })}`
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
      match: ({context}) => context.marker === 'undefined',
      apply: ({context}) => 'That is not known',
    },

    {
      where: where(),
      match: ({context}) => context.marker != null,
      apply: ({context}) => context.marker,
    },

    {
      where: where(),
      match: ({context}) => context.text,
      apply: ({context}) => context.text,
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
        flatten: (markers, context, { returnIfChanged } = {}) => {
          if (!context) {
            context = markers
            markers = ['list']
          }
          const result = flatten(markers, context)
          if (returnIfChanged) {
            return result
          } else {
            return result[0]
          }
        },
        number: (context) => isMany(context) ? "many" : "one",
        verbatim, 
        say: verbatim,
        interpolate: interpolate(args),
      }
    })
  }

knowledgeModule({ 
  config,
  includes: [tokenize, words, debugKM],
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
