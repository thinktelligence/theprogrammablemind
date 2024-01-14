const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const gdefaults_tests = require('./gdefaults.test.json')

let config = {
  name: 'gdefaults',
  generators: [
    // defaults
    {
      notes: 'show the input word',
      where: where(),
      match: ({context}) => context.paraphrase && context.word,
      apply: ({context}) => `${context.word}` 
    },

    [
      ({context}) => context.verbatim,
      ({context}) => context.verbatim
    ],

    [
      ({context}) => context.evalue,
      ({context, g}) => g(context.evalue)
    ],

    [
      ({context}) => context.evalue,
      ({context}) => `the ${context.word}` 
    ],

    {
      notes: 'show word',
      where: where(),
      match: ({context}) => context.word,
      apply: ({context}) => context.word,
    },

    {
      notes: 'show json',
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
