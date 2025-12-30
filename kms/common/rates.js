const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dimension = require('./dimension.js')
const length = require('./length.js')
const time = require('./time.js')
const rates_tests = require('./rates.test.json')
const rates_instance = require('./rates.instance.json')

/*
  miles per hour

  TODO 2 meters every 3 minutes
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
          before: ['amountOfCoordinate'],
          isA: ['unit'],
          bridge: `{ 
            ...operator, 
            numerator: before[0], 
            denominator: after[0],
            interpolate: [{ property: 'numerator', context: { number: 'many' } }, { context: operator }, { property: 'denominator' }] 
          }`,
          "enhanced_associations": true,
        },
      ],
      semantics: [
        {
          where: where(),
          match: ({context}) => context.marker == 'convertToUnits' && context.evaluate && (context.from.unit.marker == 'unitPerUnit' || context.to.marker == 'unitPerUnit'),
          apply: async ({context, kms, e, error}) => {

            async function convert(fromUnits, fromAmount, toUnits) {
              let evalue;
              if (toUnits.value == fromUnits.value) {
                evalue = fromAmount
                evalue.evalue = fromAmount.value
              } else {
                const formula = kms.formulas.api.get(toUnits, [fromUnits])
                if (!formula) {
                  const reason = { marker: 'reason', focusableForPhrase: true, evalue: { marker: 'noconversion', from: fromUnits, to: toUnits } }
                  kms.stm.api.mentioned({ context: reason })
                  error(reason)
                }
                kms.stm.api.setVariable(fromUnits.value, fromAmount)
                evalue = await e(formula)
              }
              return evalue
            }

            const evalueNumerator = await convert(context.from.unit.numerator, context.from.amount, context.to.numerator) 
            const evalueDenominator = await convert(context.from.unit.denominator, 1, context.to.denominator) 
            const evalue = { evalue: (evalueNumerator.evalue || evalueNumerator.value) / (evalueDenominator.evalue || evalueDenominator.evalue) }
            context.evalue = {
              paraphrase: true,
              marker: 'quantity',
              level: 1,
              unit: context.to,
              amount: { evalue, paraphrase: undefined }
            }
          },
        },
      ]
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
      context: [
        defaultContextCheck({ marker: 'unitPerUnit', exported: true, extra: ['numerator', 'denominator'] }),
        defaultContextCheck()
      ],
    }
  },
  template: {
    template,
    instance: rates_instance
  }
})
