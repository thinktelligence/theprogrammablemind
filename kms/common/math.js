const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const dialogues = require('./dialogues')
const numbers = require('./numbers')
const mathTemplate = require('./mathTemplate')
const math_tests = require('./math.test.json')

// TODO 10 dollars times 20
/*
    units  -> 10 feet plus 2 meters
    contact the company using gpt chat for robots
    10 dollars * quantity
*/

const toValue = (context) => {
  while( true ) { 
    if (typeof context == 'number' || !context) {
      return context
    }
    context = context.evalue
  }
}

let config = {
  name: 'math',
  operators: [
    "([mathematicalExpression])",
    "([mathematicalOperator])",
    "(([number|]) [times] ([number|]))",
    "(([number|]) [plus] ([number|]))",
    "(([number|]) [minus] ([number|]))",
    "(([number|]) [divideBy|] ([number|]))",
    { pattern: "([x])", development: true },
    { pattern: "([y])", development: true },
  ],
  bridges: [
    { id: "mathematicalExpression" },
    { id: "mathematicalOperator" },
    { id: "x", isA: ['number'], level: 0, bridge: '{ ...next(operator) }', development: true},
    { id: "y", isA: ['number'], level: 0, bridge: '{ ...next(operator) }', development: true},
    { 
        where: where(),
        id: "plus", level: 0, 
        // bridge: "{ ...next(operator), types: append(type(before[0]), type(after[0])), x: before[0], y: after[0], number: 'one' }" ,
        bridge: "{ ...next(operator), x: before[0], y: after[0], number: 'one', isResponse: true, evaluate: true }" ,
        isA: ['queryable', 'number', 'mathematicalOperator'],
        localHierarchy: [ ['unknown', 'number'] ],
        levelSpecificHierarchy: [[1, 'mathematicalExpression']],
        words: ['+'],
        generatorp: ({gp, context}) => `${gp(context.x)} ${context.word} ${gp(context.y)}`,
        evaluator: ({e, context}) => {
          const x = toValue(e(context.x)) 
          const y = toValue(e(context.y))
          if (!x || !y) {
            context.evalue = { ...context, paraphrase: true, x: { ...context.x, value: x }, y: { ...context.y, value: y } }
          } else {
            context.evalue = x + y
          }
        }
    },
    {   
        where: where(),
        id: "minus", level: 0, 
        bridge: "{ ...next(operator), x: before[0], y: after[0], number: 'one', isResponse: true, evaluate: true }" ,
        isA: ['queryable', 'number', 'mathematicalOperator'],
        localHierarchy: [ ['unknown', 'number'] ],
        words: ['-'],
        generatorp: ({gp, context}) => `${gp(context.x)} ${context.word} ${gp(context.y)}`,
        evaluator: ({e, context}) => {
          const x = toValue(e(context.x)) 
          const y = toValue(e(context.y))
          if (!x || !y) {
            context.evalue = { ...context, paraphrase: true, x: { ...context.x, value: x }, y: { ...context.y, value: y } }
          } else {
            context.evalue = x - y
          }
        }
    },
    {   
        where: where(),
        id: "times", level: 0, 
        // bridge: "{ ...next(operator), types: lub(append(type(before[0]), type(after[0]))), x: before[0], y: after[0], number: 'one' }" ,
        bridge: "{ ...next(operator), types: lub(append(operator.types, before[0].types, after[0].types)), x: before[0], y: after[0], value: null, number: 'one', isResponse: true, evaluate: true }" ,
        isA: ['queryable', 'number', 'mathematicalOperator'],
        before: [['plus', 0], ['minus', 0]],
        localHierarchy: [ ['unknown', 'number'] ],
        words: ['*'],
        generatorp: ({gp, context}) => `${gp(context.x)} ${context.word} ${gp(context.y)}`,
        evaluator: ({e, context}) => {
          const x = toValue(e(context.x)) 
          const y = toValue(e(context.y))
          if (!x || !y) {
            context.evalue = { ...context, paraphrase: true, x: { ...context.x, value: x }, y: { ...context.y, value: y } }
          } else {
            context.evalue = x * y
          }
        }
    },
    {   
        where: where(),
        id: "divideBy", level: 0, 
        // bridge: "{ ...next(operator), types: lub(append(type(before[0]), type(after[0]))), x: before[0], y: after[0], number: 'one' }" ,
        bridge: "{ ...next(operator), types: append(operator.types, before[0].types, after[0].types), x: before[0], y: after[0], value: null, number: 'one', isResponse: true, evaluate: true }" ,
        isA: ['queryable', 'number', 'mathematicalOperator'],
        before: [['plus', 0], ['minus', 0]],
        localHierarchy: [ ['unknown', 'number'] ],
        words: ['/'],
        generatorp: ({gp, context}) => `${gp(context.x)} ${context.word} ${gp(context.y)}`,
        evaluator: ({e, context}) => {
          // TODO handle divided by zero
          const x = toValue(e(context.x)) 
          const y = toValue(e(context.y))
          if (!x || !y) {
            context.evalue = { ...context, paraphrase: true, x: { ...context.x, value: x }, y: { ...context.y, value: y } }
          } else {
            context.evalue = x / y
          }
        }
    },
  ],
};

config = new Config(config, module)
config.add(numbers);
config.add(dialogues);
config.add(mathTemplate);
knowledgeModule( { 
  module,
  config,
  description: 'talking about math',
  test: {
    name: './math.test.json',
    contents: math_tests
  },
})
