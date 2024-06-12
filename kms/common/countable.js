const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require("./hierarchy")
const numbers = require("./numbers")
const countable_tests = require('./countable.test.json')


/* 
    TODO 1 to 2 countables
    10 piece nuggets vs 10 pieces of chicken
    2 6 and 3 10 piece nuggets
 */

let configStruct = {
  name: 'countable',
  operators: [
    "(([quantifier|]) [counting] ([countable]))",
    "(([number|]) [countOfPieces|] ([piece]))",
    "((countOfPieces/*) [countingPieces] ([hasCountOfPieces]))",
    "([all])",
    // everything
  ],
  bridges: [
    { 
      id: "counting", 
      convolution: true, 
      before: ['verby'],
      bridge: "{ ...after, modifiers: append(['quantity'], after[0].modifiers), quantity: before[0], number: default(before[0].number, before[0].value), instance: true }" 
    },
    { 
      id: "countOfPieces", 
      convolution: true,
      bridge: "{ ...next(operator), modifiers: append(['count'], after[0].modifiers), count: before[0], word: after.word, instance: true }" 
    },
    { 
      id: "countingPieces", 
      convolution: true,
      bridge: "{ ...after, modifiers: append(['pieces'], after[0].modifiers), pieces: before[0], instance: true }" 
    },
    { 
      id: "hasCountOfPieces", 
      isA: ['countable']
    },
    { 
      id: "piece", 
    },
    { 
      id: "quantifier", 
      children: ['number', 'all'],
    },
    { 
      id: "countable", 
      isA: ['hierarchyAble'],
    },
    { 
      id: "all", 
      generatorp: ({context}) => 'all',
      bridge: "{ ...next(operator), number: 'many' }" 
    },
  ],

  generators: [
    { 
      where: where(),
      match: ({context}) => false && context.quantity,
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
            context: [
              ...defaultContextCheck, 
              { 
                property: 'quantity', 
                filter: ['marker', 'value'],
              },
              { 
                property: 'pieces', 
                filter: [
                  'marker', 'text',
                  { property: 'count', filter: ['marker', 'value'] },
                ] 
              }]
          },
  },
})
