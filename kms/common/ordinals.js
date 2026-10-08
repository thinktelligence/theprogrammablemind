const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const ordinals_tests = require('./ordinals.test.json')
const articles = require('./articles')
const numbers = require('./numbers')
const pos = require('./pos')

const config = {
  name: 'ordinals',
  operators: [
    "([ordinal])",
    "([orderable])",
    "((ordinal/*) [ordinalOnOrdered|] (orderable/*))",
  ],
  bridges: [
    { 
      id: "ordinal", 
      isA: ["listable"],
      bridge: "{ isInstance: false, ordinal: true, ...next(operator) }",
      initial: { 'notConjunctableWith':['quantity', 'number'] },
    },
    { 
      id: "orderable", 
      bridge: "{ ...next(operator) }",
      isA: ['queryable', 'theAble'],
    },
    { 
      id: "ordinalOnOrdered", 
      isA: ['adjective'],
      convolution: true,
      // bridge: "{ ...after[0], ordinal: before[0], modifiers: append(['ordinal'], after[0].modifiers), interpolate: append(['ordinal'], or(after[0].interpolate, after)) }" 
      bridge: `{ 
        ...after[0], 
        ordinal: before[0], 
        ordinalObject: after[0],
        interpolate: [{ property: 'ordinal' }, { property: 'ordinalObject' }],
        modifiers: append(['ordinal'], after[0].modifiers) 
      }` 
    },
  ],
  semantics: [
    {
      where: where(),
      match: ({context}) => context.marker == 'mentions' && context.args?.context?.ordinal,
      apply: async ({callId, _continue, toList, context, kms, e, log, toArray, retry}) => {
        // const ordinals = toArray(context.args?.context?.ordinal)
        const lastNotFirst = context.args?.context?.ordinal.value < 0
        const quantity = context.args.context.quantity?.value || 1
        context.args.filter ??= (r) => r
        context.args.all = true
        const oldFilter = context.args.filter
        context.args.filter = (result) => {
          const reversed = context.args.frameOfReference?.namespaced?.stm?.reversed
          let selected = []
          for (const ordinal of toArray(context.args?.context?.ordinal)) {
            if (context.args.context.quantity) {
              if (lastNotFirst) {
                if (reversed) {
                  selected = selected.concat(result.slice(-quantity))
                } else {
                  selected = selected.concat(result.slice(0, quantity).reverse())
                }
              } else {
                if (!reversed) {
                  selected = selected.concat(result.slice(-quantity).reverse())
                } else {
                  selected = selected.concat(result.slice(0, quantity))
                }
              }
            } else {
              let point
              if (ordinal.value > 0) {
                point = result[ordinal.value-1]
              } else {
                point = result[result.length + ordinal.value]
              }
              if (point) {
                selected.push(point)
              }
            }
          }
          return oldFilter(selected)
        }
        _continue()
      }
    },
  ],
  words: {
    "literals": {
      "first": [{"id": "ordinal", "initial": "{ value: 1, ordinal: true, isInstance: true }" }],
      "last": [{"id": "ordinal", "initial": "{ value: -1, ordinal: true, isInstance: true }" }],
      "1st": [{"id": "ordinal", "initial": "{ value: 1, ordinal: true, isInstance: true }" }],
      "second": [{"id": "ordinal", "initial": "{ value: 2, ordinal: true, isInstance: true }" }],
      "2nd": [{"id": "ordinal", "initial": "{ value: 2, ordinal: true, isInstance: true }" }],
      "third": [{"id": "ordinal", "initial": "{ value: 3, ordinal: true, isInstance: true }" }],
      "3rd": [{"id": "ordinal", "initial": "{ value: 3, ordinal: true, isInstance: true }" }],
      "fourth": [{"id": "ordinal", "initial": "{ value: 4, ordinal: true, isInstance: true }" }],
      "4rd": [{"id": "ordinal", "initial": "{ value: 4, ordinal: true, isInstance: true }" }],
      "fifth": [{"id": "ordinal", "initial": "{ value: 5, ordinal: true, isInstance: true }" }],
      "5th": [{"id": "ordinal", "initial": "{ value: 5, ordinal: true, isInstance: true }" }],
      "sixth": [{"id": "ordinal", "initial": "{ value: 6, ordinal: true, isInstance: true }" }],
      "6th": [{"id": "ordinal", "initial": "{ value: 6, ordinal: true, isInstance: true }" }],
      "seventh": [{"id": "ordinal", "initial": "{ value: 7, ordinal: true, isInstance: true }" }],
      "7th": [{"id": "ordinal", "initial": "{ value: 7, ordinal: true, isInstance: true }" }],
      "eigth": [{"id": "ordinal", "initial": "{ value: 8, ordinal: true, isInstance: true }" }],
      "8th": [{"id": "ordinal", "initial": "{ value: 8, ordinal: true, isInstance: true }" }],
      "ninth": [{"id": "ordinal", "initial": "{ value: 9, ordinal: true, isInstance: true }" }],
      "9th": [{"id": "ordinal", "initial": "{ value: 9, ordinal: true, isInstance: true }" }],
    },
    patterns: [
      { "pattern": [{ type: 'digit' }, { repeat: true }, 'th'], defs: [{id: "ordinal", uuid: '1', initial: "{ value: int(substr(text, -2)), ordinal: true, isInstance: true }" }]},
      { "pattern": [{ type: 'digit' }, { repeat: true }, '1st'], defs: [{id: "ordinal", uuid: '1', initial: "{ value: int(substr(text, -2)), ordinal: true, isInstance: true }" }]},
      { "pattern": [{ type: 'digit' }, { repeat: true }, '2nd'], defs: [{id: "ordinal", uuid: '1', initial: "{ value: int(substr(text, -2)), ordinal: true, isInstance: true }" }]},
      { "pattern": [{ type: 'digit' }, { repeat: true }, '3rd'], defs: [{id: "ordinal", uuid: '1', initial: "{ value: int(substr(text, -2)), ordinal: true, isInstance: true }" }]},
    ],
  },
};

knowledgeModule( { 
  config,
  includes: [pos, numbers, articles],

  module,
  description: 'talking about ordinals',
  test: {
    name: './ordinals.test.json',
    contents: ordinals_tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
})
