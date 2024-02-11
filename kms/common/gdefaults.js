const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const gdefaults_tests = require('./gdefaults.test.json')

let config = {
  name: 'gdefaults',
  generators: [
    // defaults
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
      match: () => true,
      apply: ({context}) => JSON.stringify(context)
    }
  ],
};

config = new Config(config, module)

knowledgeModule({ 
  module,
  description: 'defaults for generators',
  config,
  test: {
    name: './gdefaults.test.json',
    contents: gdefaults_tests
  },
})
