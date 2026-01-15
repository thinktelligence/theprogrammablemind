//const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
//const { defaultContextCheck } = require('./helpers')
//const dialogues = require("./hierarchy")
//const numbers = require("./numbers")
//const quantifiers_tests = require('./quantifiers.test.json')
//
//let config = {
//  name: 'quantifiers',
//  operators: [
//    "(([quantifier]) [quantifierToQuantifiable|] ([quantifiable]))",
//    "([every])",
//    "([each])",
//  ],
//  bridges: [
//    { 
//      id: "quantifierToQuantifiable", 
//      convolution: true, 
//      before: ['verb'],
//      bridge: "{ ...after, modifiers: append(['quantity'], after[0].modifiers), quantity: before[0], number: default(before[0].number, before[0].value), instance: true }" 
//    },
//    { 
//      id: "quantifier", 
//      children: ['every', 'each'],
//    },
//    { 
//      id: "quantifiable", 
//    },
//  ],
//};
//
//knowledgeModule({ 
//  config,
//  includes: [dialogues, numbers],
//
//  module,
//  description: 'Quantifiers things',
//  test: {
//    name: './quantifiers.test.json',
//    contents: quantifiers_tests,
//    checks: {
//            context: [
//              ...defaultContextCheck(), 
//              { 
//                property: 'quantifier', 
//                check: ['marker', 'value'],
//              },
//          },
//  },
//})
