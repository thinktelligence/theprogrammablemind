const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require("./hierarchy")
const numbers = require("./numbers")
const countable_tests = require('./countable.test.json')

// TODO 1 to 2 countables

let configStruct = {
  name: 'countable',
  operators: [
    "(([quantifier|]) [counting] ([countable]))",
    "([all])",
    // everything
  ],
  bridges: [
    { 
      id: "counting", 
      level: 0, 
      convolution: true, 
      before: ['verby'],
      bridge: "{ ...after, quantity: before[0] }" 
    },
    { 
      id: "quantifier", 
      children: ['number', 'all'],
      level: 0, 
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "countable", 
      level: 0, 
      // isA: ['type'],
      isA: ['hierarchyAble'],
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "all", 
      level: 0, 
      generatorp: ({context}) => 'all',
      bridge: "{ ...next(operator), number: ['many'] }" 
    },
  ],

  generators: [
    { 
      where: where(),
      match: ({context}) => context.quantity,
      apply: ({context, g}) => {
        let number = context.quantity.number || 'one'
        if (context.quantity.value > 1) {
          number = 'many'
        }
        const countable = g({ ...context, quantity: undefined, number})
        return `${g(context.quantity)} ${countable}`
      }
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
  description: 'Countable things',
  createConfig,
  test: {
    name: './countable.test.json',
    contents: countable_tests,
    checks: {
            context: defaultContextCheck,
          },
  },
})
