const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const gdefaults = require("./gdefaults")
const latin_tests = require('./latin.test.json')

/*
  marcus est vir
  marcus vir est
  vir marcus est -> if vir is know to be a category and marcus is not that overides ordering

  estne
  marcus quintus iuliaque
*/
const config = {
  name: 'latin',
  operators: [
    "((hierarchy/*) [queryMarker])",
    "([hierarchiable])",
    "((hierarchiable) [hierarchy|] (hierarchiable))",
    "((hierarchiable) (hierarchiable) [hierarchy|])",
    "([hierarchy|] (hierarchiable) (hierarchiable))",
  ],
  bridges: [
    { 
      id: "queryMarker",
      bridge: "{ ...before[0], question: true }",
      separators: '|',
      before: ['hierarchy'],
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
  words: {
    literals: {
      "ne": [
        { 
          id: 'queryMarker', 
          initial: { value: 'queryMarker' },
        }
      ],
    },
    /*
    patterns: [
      { 
        pattern: ["ne"], 
        defs: [ { id: "queryMarker", uuid: '1', }, ],
      },
    ],
    */
  },
};

knowledgeModule( { 
  config,
  includes: [gdefaults],

  module,
  description: 'machina quae scriptum latinum intellegit et agit',
  test: {
    name: './latin.test.json',
    contents: latin_tests,
    checks: {
      context: [defaultContextCheck()],
    },
  },
})
