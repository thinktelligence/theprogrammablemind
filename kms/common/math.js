const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require('./dialogues')
const numbers = require('./numbers')
const punctuation = require('./punctuation')
const countable = require('./countable')
const comparable = require('./comparable')
const tests = require('./math.test.json')
const instance = require('./math.instance.json')


// TODO 10 dollars times 20
/*
    units  -> 10 feet plus 2 meters
    contact the company using gpt chat for robots
    10 dollars * quantity
*/


// TODO need to deal with value vs evalue
const toValue = (context) => {
  while( true ) { 
    if (typeof context == 'number' || !context) {
      return context
    }
    context = context.evalue || context.value
  }
}

const mathematicalOperator = (name, words, apply, before = []) => [
  { 
      where: where(),
      id: `${name}Operator`, level: 0, 
      bridge: `{ ...next(operator), marker: next(operator('${name}Expression')), types: lub(append(['mathematicalExpression'], operator.types, before[0].types, after[0].types)), value: null, x: before[0], y: after[0], number: 'one', isResponse: true, evaluate: true }` ,
      // bridge: `{ ...next(operator), marker: next(operator('${name}Expression')), value: null, x: before[0], y: after[0], number: 'one', isResponse: true, evaluate: true }` ,
      isA: ['mathematicalOperator'],
      before,
      localHierarchy: [ ['unknown', 'number'] ],
      // levelSpecificHierarchy: [[1, 'mathematicalExpression']],
      words,
      generatorp: ({gp, context}) => context.word,
  },
  { 
      where: where(),
      id: `${name}Expression`, level: 0, 
      bridge: "{ ...next(operator) }" ,
      isA: ['mathematicalExpression'],
      generatorp: ({gp, context}) => `${gp(context.x)} ${context.word} ${gp(context.y)}`,
      evaluator: ({e, context}) => {
        const x = toValue(e(context.x)) 
        const y = toValue(e(context.y))
        if (!x || !y) {
          // context.evalue = { ...context, paraphrase: true, x: { ...context.x, value: x }, y: { ...context.y, value: y } }
          context.isResponse = false
        } else {
          context.evalue = apply(x, y)
          context.evalue.isResponse = true
          context.evalue.paraphrase = false
          // context.paraphrase = false
          // context.isResponse = true
        }
        /*
        if (!context.value) {
          context.isResponse = false
          context.paraphrase = true
        }
        */
      }
  }
]
    
let configStruct = {
  name: 'math',
  operators: [
    "([mathematicalExpression])",
    "([mathematicalOperator])",
    "(([number|]) [plusOperator] ([number|]))",
    "(([number|]) [minusOperator] ([number|]))",
    "(([number|]) [timesOperator] ([number|]))",
    "(([number|]) [divideByOperator|] ([number|]))",
    "([plusExpression|])", 
    "([minusExpression|])", 
    "([timesExpression|])", 
    "([divideByExpression|])", 
    { pattern: "([x])", development: true },
    { pattern: "([y])", development: true },
  ],
  bridges: [
    { 
      id: "mathematicalExpression",
      // isA: ['queryable', 'theAble'],
      isA: ['concept', 'number'],
    },
    { 
      id: "mathematicalOperator", 
      before: ['verby'],
      after: ['adjective'],
    },
    { id: "x", isA: ['number'], level: 0, bridge: '{ ...next(operator) }', development: true},
    { id: "y", isA: ['number'], level: 0, bridge: '{ ...next(operator) }', development: true},
    ...mathematicalOperator('plus', ['plus', '+'], (x, y) => x + y),
    ...mathematicalOperator('minus', ['minus', '-'], (x, y) => x - y),
    ...mathematicalOperator('times', ['times', '*'], (x, y) => x * y, [['plusOperator', 0], ['minusOperator', 0]]),
    ...mathematicalOperator('divideBy', ['/'], (x, y) => x / y, [['plusOperator', 0], ['minusOperator', 0]]),
  ],
};

const template = {
  queries: [
    "mathematical modifies operator",
    "* + / and - are mathematical operators",
    configStruct,
  ]
}

const createConfig = () => {
  const config = new Config({ name: 'math' }, module)
  config.add(numbers(), dialogues(), punctuation(), countable(), comparable())
  return config
}

knowledgeModule( { 
  module,
  createConfig,
  description: 'talking about math',
  template: { template, instance },
  test: {
    name: './math.test.json',
    contents: tests,
    checks: {
            context: defaultContextCheck,
          },

  },
})
