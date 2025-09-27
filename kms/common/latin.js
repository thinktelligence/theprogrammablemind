const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const gdefaults = require("./gdefaults")
const { getDeclensions } = require("./latin_helpers")
const latin_tests = require('./latin.test.json')
const latin_instance = require('./latin.instance.json')

/*
  marcus est vir
  marcus vir est
  vir marcus est -> if vir is know to be a category and marcus is not that overides ordering

  estne
  marcus quintus iuliaque

  oculi lupi in umbra lucent ut gemmae et dentes ut margaritae
    oculi lupi in umbra lucent ut gemmae -> get this
    dentes ut margaritae -> have these cases. reinterpret the first one uses the new cases oculi -> dentes + ut gemmae -> ut margaritae

  equus et aninus leo et lupus canis et ovis bestiae sunt    
  aliae bestiae sunt aves aliae pisces
  moribus antiquis res stat romana virisque
*/
const config = {
  operators: [
    "((hierarchy/*) [queryMarker|ne])",
    "([hierarchiable])",
    "((hierarchiable) [hierarchy|] (hierarchiable))",
    "((hierarchiable) (hierarchiable) [hierarchy|])",
    "([hierarchy|] (hierarchiable) (hierarchiable))",

    "(x [list|et] y)",
    "((listable/*) [listMarker|que])",
  ],
  bridges: [
    {
      id: "dare",
      level: 0,
      bridge: "{ ...next(operator), giver: nominative?, receiver: dative?, object: accusative?, interpolate: [{ property: 'giver' }, { property: 'receiver' }, { property: 'object' }, operator] }",
      selector: {
        arguments: {
          nominative: "(context.declension == 'nominative' && context.number == operator.number)",
          dative: "(context.declension == 'dative')",
          accusative: "(context.declension == 'accusative')",
        },
      },
      words: [
        { word: 'do', number: 'singular', person: 'first' },
        { word: 'das', number: 'singular', person: 'second' },
        { word: 'dat', number: 'singular', person: 'third' },
        { word: 'datus', number: 'plural', person: 'first' },
        { word: 'datis', number: 'plural', person: 'second' },
        { word: 'dant', number: 'plural', person: 'third' },
      ]
    },
    {
      id: "list",
      level: 0,
      selector: {
          match: "same",
          left: [ { pattern: '($type && context.instance == variables.instance)' } ],
          right: [ { pattern: '($type && context.instance == variables.instance)' } ],
          passthrough: true
      },
      bridge: "{ ...next(operator), listable: true, isList: true, value: append(before, after), operator: operator, interpolate: [ { separator: 'operator', values: 'value' } ] }"
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

    { 
      id: "queryMarker",
      bridge: "{ ...before[0], verb: before[0], interpolate: [before[0], '', operator], question: true }",
      separators: '|',
      before: ['hierarchy'],
    },
    { 
      id: "listMarker",
      localHierarchy: [['unknown', 'listable']],
      bridge: "{ ...before[0], verb: before[0], interpolate: [before[0], '', operator], isList: true }",
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
    ({config}) => {
      config.addArgs(({config, api, isA}) => ({
        addLatinNoun: ({ id, nominative, genetive, development }) => {
          config.addOperator({ pattern: `([${id}|])`, development: development })
          config.addBridge({ id, isA: ['hierarchiable'] })
          const declensions = getDeclensions(nominative, genetive)
          for (const declension of declensions) {
            config.addWord(declension.word, { id, initial: { ...declension, development } })
          }
        }
      }))
    },
    ({addLatinNoun}) => {
      addLatinNoun({ id: 'davus_person', nominative: 'davus', development: true })
      addLatinNoun({ id: 'titus_person', nominative: 'titus', development: true })
      addLatinNoun({ id: 'pear_food', nominative: 'pirum', development: true })
    },
    config,
    ({addSuffix}) => addSuffix('que'),
  ]
}

knowledgeModule( { 
  config: { name: 'latin' },
  // initializer,
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
