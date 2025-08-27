const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const gdefaults = require('./gdefaults.js')
const conjunction_tests = require('./conjunction.test.json')
const { defaultContextCheck2, propertyToArray } = require('./helpers')
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
  generators: [
    {
      where: where(),
      notes: 'handle lists with yes no',
      // ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value,
      // ({context, hierarchy}) => context.marker == 'list' && context.value,
      match: ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value && context.value.length > 0 && context.value[0].marker == 'yesno',
      apply: async ({context, g, gs}) => {
        return `${await g(context.value[0])} ${await gs(context.value.slice(1), ', ', ' and ')}`
      }
    },

    {
      where: where(),
      notes: 'handle lists',
      // ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value,
      // ({context, hierarchy}) => context.marker == 'list' && context.value,
      match: ({context, hierarchy}) => context.marker == 'list' && context.value,
      apply: async ({context, gs}) => {
        if (context.newLinesOnly) {
          return await gs(context.value, '\n')
        } else {
          return await gs(context.value, ', ', ' and ')
        }
      }
    },
  ],
};

const initializer = ({objects, config, isModule}) => {
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
  includes: [gdefaults],
  initializer,

  module,
  description: 'framework for conjunction',
  newWay: true,
  test: {
    name: './conjunction.test.json',
    contents: conjunction_tests,
    checks: {
            objects: ['idSuffix'],
            ...defaultContextCheck2(),
          },

  },
})
