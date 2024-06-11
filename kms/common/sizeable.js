const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require("./hierarchy")
const numbers = require("./numbers")
const sizeable_tests = require('./sizeable.test.json')

// TODO 1 to 2 sizeables

let configStruct = {
  name: 'sizeable',
  operators: [
    "(([size|]) [sizing] ([sizeable]))",
  ],
  bridges: [
    { 
      id: "sizing", 
      level: 0, 
      convolution: true, 
      before: ['verby'],
      bridge: "{ ...after, size: before[0], modifiers: append(['size'], after.modifiers) }" 
    },
    { 
      id: "size", 
      parents: ['adjective'],
      words: ['small', 'medium', 'large', 'half', 'full'],
      level: 0, 
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "sizeable", 
      level: 0, 
      isA: ['hierarchyAble'],
      bridge: "{ ...next(operator) }" 
    },
  ],

  priorities: [
    { context: [['articlePOS', 0], ['sizing', 0]], choose: [1] },
  ],

  generators: [
    { 
      where: where(),
      match: ({context}) => context.size && false,
      apply: ({context, g}) => `${g(context.size)} ${context.sizeable}`,
    },
  ]
};

const createConfig = () => {
  const config = new Config(configStruct, module)
  config.add(dialogues()).add(numbers())
  return config
}

knowledgeModule({ 
  module,
  description: 'Sizeable things',
  createConfig,
  test: {
    name: './sizeable.test.json',
    contents: sizeable_tests,
    checks: {
            context: defaultContextCheck,
          },
  },
})
