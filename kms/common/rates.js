const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dimension = require('./dimension.js')
const length = require('./length.js')
const time = require('./time.js')
const rates_tests = require('./rates.test.json')
const rates_instance = require('./rates.instance.json')

/*
  miles per hour
*/

const template = {
  configs: [
    {
      operators: [
        // "((mile) [unitPerUnit|per] (hour))", 
        "((context.dimension != undefined) [unitPerUnit|per] (context.dimension != undefined))", 
      ],
      bridges: [
        {
          id: 'unitPerUnit',
          bridge: `{ 
            ...operator, 
            numerator: before[0], 
            denominator: after[0],
            interpolate: [{ property: 'numerator', context: { number: 'many' } }, { context: operator }, { property: 'denominator' }] 
          }`,
          "enhanced_associations": true,
        },
      ],
    },
  ],
}

knowledgeModule({ 
  config: { name: 'rates' },
  includes: [dimension, length, time],

  module,
  description: 'Length dimension',
  test: {
    name: './rates.test.json',
    contents: rates_tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
  template: {
    template,
    instance: rates_instance
  }
})
