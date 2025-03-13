const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require("./hierarchy")
const numbers = require("./numbers")
const sizeable_tests = require('./sizeable.test.json')

// TODO 1 to 2 sizeables

const config = {
  name: 'sizeable',
  operators: [
    "(([size|]) [sizing] ([sizeable]))",
  ],
  bridges: [
    { 
      id: "sizing", 
      level: 0, 
      convolution: true, 
      before: ['verb'],
      bridge: "{ ...after, size: before[0], modifiers: append(['size'], after.modifiers) }" 
    },
    { 
      id: "size", 
      parents: ['adjective'],
      words: [
                { word: 'small', value: 'small' }, 
                { word: 'medium', value: 'medium' }, 
                { word: 'large', value: 'large' },
                { word: 'half', value: 'half' }, 
                { word: 'full', value: 'full' }],
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
    { context: [['article', 0], ['sizing', 0]], choose: [1] },
  ],

  generators: [
    { 
      where: where(),
      match: ({context}) => context.size && false,
      apply: ({context, g}) => `${g(context.size)} ${context.sizeable}`,
    },
  ]
};

knowledgeModule({ 
  config,
  includes: [dialogues, numbers],

  module,
  description: 'Sizeable things',
  test: {
    name: './sizeable.test.json',
    contents: sizeable_tests,
    checks: {
            context: [ ...defaultContextCheck(), { property: 'size', filter: ['value'] } ],
          },
  },
})
