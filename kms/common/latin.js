const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const gdefaults = require("./gdefaults")
const latin_tests = require('./latin.test.json')
const latin_instance = require('./latin.instance.json')

/*
  marcus est vir
  marcus vir est
  vir marcus est -> if vir is know to be a category and marcus is not that overides ordering

  estne
  marcus quintus iuliaque
*/
const config = {
  operators: [
    "((hierarchy/*) [queryMarker|ne])",
    "((listable/*) [listMarker|que])",
    "([hierarchiable])",
    "((hierarchiable) [hierarchy|] (hierarchiable))",
    "((hierarchiable) (hierarchiable) [hierarchy|])",
    "([hierarchy|] (hierarchiable) (hierarchiable))",
  ],
  bridges: [
    { 
      id: "queryMarker",
      bridge: "{ ...before[0], verb: before[0], interpolate: [before[0], '', operator], question: true }",
      separators: '|',
      before: ['hierarchy'],
    },
    { 
      id: "listMarker",
      localHierarchy: [['unknown', 'listable']],
      bridge: "{ ...before[0], verb: before[0], interpolate: [before[0], '', operator], list: true }",
      separators: '|',
    },
    { id: "hierarchiable" },
    { 
      id: "hierarchy",
      localHierarchy: [['unknown', 'hierarchiable']],
      bridge:  "{ ...next(operator), child: arguments[0], parent: arguments[1], question: less_than(indexes.operator, indexes.arguments[0]), interpolate: all }",
      words: [
        { word: 'sum', number: 'singular', person: 'first' },
        { word: 'es', number: 'singular', person: 'second' },
        { word: 'est', number: 'singular', person: 'third' },
        { word: 'sumus', number: 'plural', person: 'first' },
        { word: 'estis', number: 'plural', person: 'second' },
        { word: 'sunt', number: 'plural', person: 'third' },
      ]
    },
  ],
  semantics: [
    {
      match: ({context}) => context.marker == 'unknown',
      apply: ({context, config, addWord}) => {
        const id = context.word
        const word = context.word
        config.addWord(word, { id, value: id })
        config.addOperator(`([${id}|])`)
        config.addBridge({ id, isA: ['hierarchiable'] })
      }
    }
  ],
};

const template = {
  configs: [
    config,
    ({addSuffix}) => addSuffix('que'),
  ]
}

knowledgeModule( { 
  config: { name: 'latin' },
  includes: [gdefaults],

  module,
  description: 'machina quae scriptum latinum intellegit et agit',
  test: {
    name: './latin.test.json',
    contents: latin_tests,
    includes: {
      words: {
        literals: ['marcus'],
      },
      bridges: ['marcus'],
      operators: ['([marcus|])'],
    },
    checks: {
      context: [defaultContextCheck()],
    },
  },

  template: {
    template,
    instance: latin_instance,
  },
})
