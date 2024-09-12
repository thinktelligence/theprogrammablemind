const pluralize = require('pluralize')
const { defaultContextCheck } = require('./helpers')
const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const tokenize = require('./tokenize.js')
const gdefaults_tests = require('./gdefaults.test.json')
const { isMany } = require('./helpers.js')

let configStruct = {
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
      //({context}) => context.paraphrase && context.modifiers,
      // match: ({context}) => context.paraphrase && (context.modifiers || context.postModifiers),
      match: ({context}) => (context.modifiers || context.postModifiers),
      apply: ({context, g, gs, callId}) => {
        const text = []
        for (modifier of (context.modifiers || [])) {
          if (Array.isArray(context[modifier])) {
            for (let m of context[modifier]) {
              text.push(g(m))
            }
          } else {
            text.push(g(context[modifier], { isModifier: true }))
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
          text.push(g({...context, number: 'one', postModifiers: undefined, modifiers: undefined}))
        } else {
          text.push(g({...context, number, postModifiers: undefined, modifiers: undefined}))
        }
        for ([index, modifier] of (context.postModifiers || []).entries()) {
          if (index == context.postModifiers.length - 1) {
            text.push(g({...context[modifier], number}))
          } else {
            text.push(g(context[modifier]))
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
      match: ({context}) => context.evaluateWord && context.paraphrase && context.word && (context.number == 'many' || countext.number > 1),
      apply: ({context}) => pluralize.plural(context.word),
    },

    {
      where: where(),
      priority: -1,
      match: ({context}) => context.evaluateWord && context.paraphrase && context.word && context.number == 'one',
      apply: ({context}) => pluralize.singular(context.word),
    },

    {
      where: where(),
      match: ({context}) => context.paraphrase && context.word && (context.number == 'many' || context.number > 1),
      apply: ({context}) => {
        return pluralize.plural(context.word)
      }
    },

    {
      where: where(),
      match: ({context}) => context.paraphrase && context.word && context.number == 'one',
      apply: ({context}) => {
        return pluralize.singular(context.word)
      }
    },

    {
      where: where(),
      match: ({context}) => context.paraphrase && context.word,
      apply: ({context}) => `${context.word}` 
    },

    {
      where: where(),
      match: ({context}) => context.verbatim,
      apply: ({context}) => context.verbatim
    },

    {
      where: where(),
      match: ({context}) => context.evalue,
      apply: ({context, g}) => g(context.evalue)
    },

    {
      where: where(),
      match: ({context}) => context.value && Array.isArray(context.value),
      apply: ({context, gs}) => gs(context.value)
    },

    {
      where: where(),
      match: ({context}) => context.value,
      apply: ({context, g}) => g(context.value)
    },

    {
      where: where(),
      match: ({context}) => context.evalue,
      apply: ({context}) => `the ${context.word}` 
    },

    {
      where: where(),
      match: ({context}) => context.isResponse && context.response,
      apply: ({context, gp}) => gp(context.response),
    },

    {
      where: where(),
      match: ({context}) => context.word,
      apply: ({context}) => context.word,
    },

    {
      where: where(),
      match: ({context}) => context.marker,
      apply: ({context}) => context.marker,
    },

    {
      where: where(),
      match: () => true,
      apply: ({context}) => JSON.stringify(context)
    }
  ],
};

const createConfig = async () => {
  const config = new Config(configStruct, module)
  await config.add(tokenize)
  config.initializer( ({config}) => {
    config.addArgs((args) => {
      return {
        number: (context) => isMany(context) ? "many" : "one",
        // number/gender/person etc
        gw: (context, { number: numberContext }) => {
          const number = numberContext ? args.number(numberContext) : context.number;
          return args.gp( { ...context, evaluateWord: true, number } )
        },
        verbatim: (text) => {
          args.insert({ marker: 'verbatim', verbatim: text, isResponse: true })
        },
      }
    })
  })
  return config
}

knowledgeModule({ 
  module,
  description: 'defaults for generators',
  createConfig,
  test: {
    name: './gdefaults.test.json',
    contents: gdefaults_tests,
    checks: {
            context: defaultContextCheck,
          },

  },
})
