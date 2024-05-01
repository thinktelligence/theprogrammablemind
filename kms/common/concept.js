const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
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
const config = new Config({
  name: 'concept',
  operators: [
    "((modifier) [modifies|] (concept))",
    "([concept])",
  ],
  bridges: [
    {
      id: "modifies",
      isA: ['verby'],
      words: [{ word: 'modifies', number: 'one' }, { word: 'modify', number: 'many' }],
      bridge: "{ ...next(operator), modifier: before[0], concept: after[0] }"
    },
    { id: "concept", level: 0, bridge: "{ ...next(operator) }" },
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
        // debugger;
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

        for (let value of context.value) {
          if (!(value.modifiers && value.modifiers.length == 1 && value.word == word)) {
            return
          }
        }
        return true
      },
      apply: ({g, context}) => {
        const modifiers = context.value.map( (p) => p[p.modifiers[0]] )
        context.word = context.value[0].word
        context.value = null
        context.modifiers = ['modifier']
        context.modifier = {
          marker: 'list',
          paraphrase: true,
          value: modifiers
        }
        context.paraphrase = true
        return g(context)
      }
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'modifies' && context.paraphrase,
      apply: ({context, gp, gw}) => `${gp(context.modifier)} ${gw(context, { number: context.modifier })} ${context.concept.word}`,
      // const chosen = chooseNumber(context, word.singular, word.plural)
    },
  ],
  semantics: [
    {
      notes: 'define a modifier',
      where: where(),
      match: ({context}) => context.marker == 'modifies',
      apply: ({config, km, context}) => {
        km('concept').api.kindOfConcept({ config, modifier: context.modifier.value, object: context.concept.value || context.concept.marker })
      }
    },
  ],
}, module)
config.api = new API()
config.add(dialogues)

knowledgeModule({ 
  module,
  description: 'The idea of a concept whatever that might end up being',
  config,
  test: {
    name: './concept.test.json',
    contents: concept_tests,
  }
})
