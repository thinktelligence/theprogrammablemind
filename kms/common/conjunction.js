const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const stm = require('./stm.js')
const conjunction_tests = require('./conjunction.test.json')
const { toFinalValue, defaultObjectCheck, defaultContextCheck, propertyToArray } = require('./helpers')
const { isA, asList, listable } = require('./helpers/conjunction.js')

const config = {
  name: 'conjunction',
  operators: [
    "(x [list|and] y)",
  ],
  bridges: [
    // context.instance == variables.instance (unification)
    {
      id: "list", 
      level: 0, 
      /*
      localHierarchy: [
        ['unknown', 'listable'],
      ],
      */
      selector: {
          match: "same", 
          left: [ { pattern: '($type && context.instance == variables.instance)' } ], 
          right: [ { pattern: '($type && context.instance == variables.instance)' } ], 
          // left: [ { pattern: '($type)' } ], 
          // right: [ { pattern: '($type)' } ], 
          passthrough: true
      }, 
      bridge: "{ ...next(operator), listable: true, isList: true, value: append(before, after) }"
    },
    {
      id: "list", 
      level: 1, 
      selector: {
          match: "same", 
          left: [ { pattern: '($type && context.instance == variables.instance)' } ], 
          passthrough: true
     }, 
      bridge: "{ ...operator, value: append(before, operator.value) }"
    },
  ],
  semantics: [
    {
      where: where(),
      notes: 'evaluate elements of the list individually',
      match: ({context, callId}) => context.marker == 'list' && context.evaluate,
      apply: async ({context, toArray, toList, e, resolveEvaluate}) => {
        const list = []
        for (const element of toArray(context)) {
          list.push(await e(element))
        }
        resolveEvaluate(context, toList(list))
      }
    },
  ],
  generators: [
    {
      where: where(),
      notes: 'handle lists with yes no',
      match: ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value && context.value.length > 0 && context.value[0].marker == 'yesno',
      apply: async ({context, g, gs}) => {
        return `${await g(context.value[0])} ${await gs(context.value.slice(1), ', ', ' and ')}`
      }
    },

    /*
    {
      where: where(),
      notes: 'handle lists with truthValue set',
      match: ({context, hierarchy}) => context.marker == 'list' && context.hasOwnProperty('truthValue'),
      apply: async ({context, g, gs}) => {
        return context.truthValue ? 'yes' : 'no'
      }
    },
    */

    {
      where: where(),
      notes: 'handle lists',
      match: ({context, hierarchy}) => context.marker == 'list' && context.value,
      apply: async ({context, gs}) => {
        if (context.newLinesOnly) {
          return await gs(toFinalValue(context), '\n')
        } else {
          return await gs(toFinalValue(context), ', ', ' and ')
        }
      }
    },
  ],
};

function initializer({objects, config, isModule}) {
  config.addArgs(({config, api, hierarchy}) => {
    const isAI = isA(hierarchy);

    return { 
      isAListable: (context, type) => {
        if (context.marker == 'list' || context.listable) {
          return context.value.every( (element) => isAI(element.marker, type) )
        } else {
          return isAI(context.marker, type)
        } 
      },
      asList,
      toList: asList,
      toArray: propertyToArray,
      listable: listable(hierarchy),
      isA: isAI,
      toContext: (v) => {
        if (Array.isArray(v)) {
          return { marker: 'list', level: 1, value: v }
        }
        if (v.marker == 'list') {
          return v
        }
        return v
      },
    }
  })
}

knowledgeModule( { 
  config,
  includes: [stm],
  initializer,

  module,
  description: 'framework for conjunction',
  newWay: true,
  test: {
    name: './conjunction.test.json',
    contents: conjunction_tests,
    checks: {
      context: [defaultContextCheck()],
    },
  },
})
