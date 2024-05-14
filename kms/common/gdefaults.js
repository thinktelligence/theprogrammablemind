const pluralize = require('pluralize')
const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
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
    {
      where: where(),
      priority: -1,
      match: ({context}) => context.marker == 'modifies' && context.evaluateWord && context.paraphrase && context.number == 'one',
      apply: ({context}) => 'modifies'
    },
    {
      where: where(),
      priority: -1,
      match: ({context}) => context.marker == 'modifies' && context.evaluateWord && context.paraphrase && context.number == 'many',
      apply: ({context}) => 'modify'
    },

    {
      where: where(),
      priority: -1,
      match: ({context}) => context.evaluateWord && context.paraphrase && context.word && context.number == 'many',
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
      match: ({context}) => context.paraphrase && context.word && context.number == 'many',
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

const createConfig = () => {
  const config = new Config(configStruct, module)
  config.initializer( ({config}) => {
    config.addArgs((args) => {
      return {
        number: (context) => isMany(context) ? "many" : "one",
        // number/gender/person etc
        gw: (context, { number: numberContext }) => {
          const number = numberContext ? args.number(numberContext) : context.number;
          return args.gp( { ...context, evaluateWord: true, number } )
        }
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
    contents: gdefaults_tests
  },
})
