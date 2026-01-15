const { knowledgeModule, flatten, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck, defaultContextCheckProperties } = require('./helpers')
const { API }= require('./helpers/concept')
const dialogues = require('./dialogues.js')
const concept_tests = require('./concept.test.json')
const concept_instance = require('./concept.instance.json')
// const { chooseNumber } = require('../helpers.js')

/*
  pokemon modifies type fire water and ice modifie pokemon type type means pokemon type
  first name last name is a pattern for the name of people
  ice and sour modify cream
  plain and regular fries are the same thing
  plain and regular fries mean the same thing
*/

config = {
  name: 'concept',
  operators: [
    "((punctuation != true)* [modifies|] (_any))",
    "([concept])",
    "([literally] (modifies/0))",
  ],
  bridges: [
    {
      id: "modifies",
      isA: ['verb'],
      words: [{ word: 'modifies', number: 'one', flatten: false }, { word: 'modify', number: 'many', flatten: true }],
      // bridge: "{ ...next(operator), modifiers: before, concept: after[0], flatten: true }"
      bridge: "{ ...next(operator), conceptModifiers: before[0], concept: after[0] }",
      semantic: {
        notes: 'define a modifier',
        where: where(),
        apply: ({config, query, km, context}) => {
          let modifiers
          if (context.literally) {
            literalModifiers = context.conceptModifiers[0]
            // modifiers = literalModifiers.value.map(modifier => modifier.value)
            modifiers = literalModifiers.value
            modifiers = modifiers.slice(0, -1).concat([literalModifiers.marker]).concat(modifiers.slice(-1))
          } else {
            modifiers = context.conceptModifiers
            // modifiers = context.modifiers.map(modifier => modifier.value)
          }
          if (!modifiers) {
            debugger
          }
          // km('concept').api.kindOfConcept({ config, modifiers, object: context.concept.value || context.concept.marker })
          km('concept').api.kindOfConcept({ config, modifiers, object: context.concept })
        }
      },
      check: defaultContextCheckProperties(['concept', 'conceptModifiers']),
    },
    { id: "literally", bridge: "{ ...after[0], flatten: false, literally: true }" },
    { id: "concept" },
  ],
  priorities: [
    { "context": [['literally', 0], ['modifies', 0], ], "choose": [0] },
  ],
  hierarchy: [
    ['concept', 'theAble'],
    ['concept', 'queryable'],
  ],
  generators: [
    {
      notes: '"fire type, water type and earth type" to "fire water and earth type"',
      /*
        {
          "water": {
            "marker": "water",
            "value": "water",
            "word": "water"
          },
          "marker": "water_type",
          "modifiers": [
            "water"
          ],
          "types": [
            "water_type"
          ],
          "value": "water_type",
          "word": "type",
          "paraphrase": true
        },
      */
      where: where(),
      match: ({context}) => {
        if (!context.paraphrase) {
          return
        }
        if (context.marker !== 'list') {
          return
        }
        if ((context.value || []).length < 2) {
          return
        }
        if (!context.value[0].word) {
          return
        }
        const word = context.value[0].word

        for (const value of context.value) {
          if (!(value.conceptModifiers && value.conceptModifiers.length == 1 && value.word == word)) {
            return
          }
        }
        return true
      },
      apply: async ({g, context}) => {
        const modifiers = context.value.map( (p) => p[p.conceptModifiers[0]] )
        context.word = context.value[0].word
        context.value = null
        context.modifiers = ['modifier']
        context.modifier = {
          marker: 'list',
          paraphrase: true,
          value: modifiers
        }
        context.paraphrase = true
        return await g(context)
      }
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'modifies' && context.paraphrase,
      apply: async ({context, gp, gw}) => {
        const modifiers = []
        for (modifier of context.conceptModifiers) {
          modifiers.push(await gp(modifier))
        }
        if (context.literally) {
          return `${modifiers.join(" ")} literally ${await gw(context, { number: context.conceptModifiers[context.conceptModifiers.length - 1] })} ${await gp(context.concept)}`
        } else {
          return `${modifiers.join(" ")} ${await gw(context, { number: context.conceptModifiers[context.conceptModifiers.length - 1] })} ${await gp(context.concept)}`
        }
      }
      // const chosen = chooseNumber(context, word.singular, word.plural)
    },
  ],
}

knowledgeModule({ 
  config,
  includes: [dialogues],
  api: () => new API(),

  module,
  description: 'The idea of a concept whatever that might end up being',
  test: {
    name: './concept.test.json',
    contents: concept_tests,
    checks: {
      context: [defaultContextCheck()],
    }
  }
})
