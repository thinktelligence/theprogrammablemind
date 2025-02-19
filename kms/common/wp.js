const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const helpers = require("./helpers")
const ui = require("./ui")
const countable = require("./countable")
const colors = require("./colors")
const errors = require("./errors")
const wp_tests = require('./wp.test.json')
const instance = require('./wp.instance.json')

/*
  working on
    bold the first word
    bold the first paragraph 
    bold the first letter

    after
    bold the first word of every paragraph
    bold the first letter of every word

    after
    make the words that start with t blue

  the bolded words that start with t

  start inserting text until I say banana
  ...
  or 
  stop inserting text

  make the text of the 1st to 3rd paragraphs blue
  
  capitalize the words banana and word
  capitalize banana and tree

  make the words that start with a bold

  make every word bold and underlines and blue -> weirdly "bold underlined and blue" works

  make the font ... 
  make the color blue
  make the color of the first paragraph blue

  undeline the bolded text / the text that is bolded

  words that start with a
  make all the bold text uppercase
  underline all the bold text
  underline all the text
  underline everything
  4 letter word
  4 to 6 letter word
  word with 'a' in it
  words containing a
  every 5th word

  the words that are capitalized 

  in the first paragraph make the words that start with abc bold
  bold the first three words that start with t
  bold much and many
  make the words that start with t bold and underlined
  make all the capital letters|punctuation bold

  move this paragraph up 2
  move the next paragraph up 1
  move the last paragraph before this one
*/

class API {
  initialize({ objects }) {
    this._objects = objects
    this._objects.changeState = []
  }

  changeState(value) {
    this._objects.changeState.push(value)
  }
}

const root = (id) => {
  return id.split('_')[0]
}

const setUpdate = (isA, update, states) => {
  let color;
  const styles = []
  for (const state of states) {
    if (isA(state, 'style_wp')) {
      if (!update.styles) {
        update.styles = []
      }
      let style = root(state.value)
      /*
      if (style == 'underlined') {
        style = 'underline'
      } else if (style == 'italicize') {
        style = 'italic'
      }
      */
      update.styles.push(style)
    } else {
      update.color = root(state.value)
    }
  }
}

const api = new API()

let config = {
  name: 'wp',
};

const changeState = ({api, isA, context, toArray, element, state}) => {
  let unit = root(context.element.marker)
  let scope
  let conditions = []

  if (context.element.ordinal) {
    conditions.push({ ordinals: toArray(context.element.ordinal).map((context) => context.value)})
  } else if (isA(context.element, 'everything')) {
    scope = 'all'
  } else if (context.element.quantity) {
    scope = context.element.quantity.quantity
  }

  if (context.element.conditions) {
    for (const condition of context.element.conditions) {
      if (condition.marker == 'wordComparisonWith_wp') {
        // with or not with that is the question
        const letters = condition.letters.letters.text
        conditions.push({ comparison: condition.comparison, letters })
      } else if (condition.marker == 'wordComparison_wp') {
        // with or not with that is the question
        const letters = condition.letters.text
        conditions.push({ comparison: condition.comparison, letters })
      } else if (isA(condition, 'styleModifier_wp')) {
        for (const style of toArray(condition)) {
          conditions.push({ hasStyle: style.marker })
        }
      }
    }
  }

  const update = { unit, scope, conditions }
  setUpdate(isA, update, toArray(context.state))
  api.changeState(update)
}

template = {
  configs: [
    'setidsuffix _wp',
    'words are countable orderable and statefulElements',
    'characters are countable orderable and statefulElements',
    'paragraphs are countable orderable and statefulElement',
    'text is a statefulElement',
    'letters means characters',
    'bold, italic, code, capitalize, lowercase and underline are styles',
    'underlined means underline',
    'capitalized means capitalize',
    'uppercase means capitalize',
    'italicize means italic',
    'italicized means italic',
    // TODO have a mode where I can stay this is a definition sentence then just say style modifies and it will do it right
    'uppercased, lowercased, capitalized, bolded, italicized and underlined are styleModifiers',
    // 'start end and contain are wordComparisonWiths',
    // 'styles are negatable',
    "resetIdSuffix",
    {
      operators: [
        "([changeState_wp|make] ([statefulElement_wp]) ([stateValue_wp|]))",
        "((style_wp/*) [applyStyle_wp] ([statefulElement_wp|]))",
        "((word_wp/*) [wordComparisonWith_wp] ([comparisonWith_wp|with] (a/0)? (letters)))",
        "((word_wp/*) [wordComparison_wp] (a/0)? (letters))",
        // this one is "the bolded/underlined/italized/... word"
        "((styleModifier_wp/*) [modifiedByStyle_wp] (statefulElement_wp/* && context.determiner == undefined))",
      ],
      bridges: [
        { 
          id: 'modifiedByStyle_wp',
          // parents: ['verb'],
          parents: ['adjective'],
          convolution: true,
          bridge: "{ ...after[0], style: before[0], target: after[0], generate: ['style', 'target'], conditions: append(after[0].conditions, [before[0]]) }",
        },
        { 
          id: 'wordComparisonWith_wp',
          parents: ['verb'],
          words: [ 
            { word: 'start', comparison: 'prefix' }, 
            { word: 'starts', comparison: 'prefix', },
            { word: 'end', comparison: 'suffix' },
            { word: 'ends', comparison: 'suffix' },
          ],
          bridge: "{ ...next(operator), element: before[0], subject: before[0], letters: after[0], verb: operator, generate: ['element', 'verb', 'letters'] }",
        },
        { 
          id: 'wordComparison_wp',
          parents: ['verb'],
          words: [ 
            { word: 'contain', comparison: 'include' }, 
            { word: 'contains', comparison: 'include' },
            { word: 'include', comparison: 'include' }, 
            { word: 'includes', comparison: 'include' },
          ],
          optional: {
            1: "{ marker: 'a' }",
          },
          bridge: "{ ...next(operator), element: before[0], subject: before[0], letters: after[1], verb: operator, generate: ['element', 'verb', 'letters'] }",
        },
        { 
          id: 'comparisonWith_wp',
          parents: ['preposition'],
          optional: {
            1: "{ marker: 'a' }",
          },
          bridge: "{ ...next(operator), operator: operator, letters: after[1], generate: ['operator', 'letters'] }",
        },
        { 
          id: 'applyStyle_wp',
          parents: ['verb'],
          convolution: true,
          bridge: "{ ...next(operator), element: after[0], state: before[0], operator: operator, generate: ['state', 'element'] }",
          localHierarchy: [
            ['thisitthat', 'statefulElement_wp'],
            ['everything', 'statefulElement_wp'],
          ],
          semantic: (args) => {
            changeState({...args, element: args.context.element, state: args.context.state})
          }
        },
        { 
          id: 'changeState_wp',
          parents: ['verb'],
          bridge: "{ ...next(operator), element: after[0], state: after[1], operator: operator, generate: ['operator', 'element', 'state'] }",
          localHierarchy: [
            ['thisitthat', 'statefulElement_wp'],
            ['everything', 'statefulElement_wp'],
          ],
          semantic: (args) => {
            changeState({...args, element: args.context.element, state: args.context.state})
          }
        },
        { 
          id: 'stateValue_wp',
          children: ['color_colors', 'style_wp'],
        },
      ],
      semantics: [
        {
          where: where(),
          match: ({context, isA}) => isA(context, 'style_wp') && !context.same && !context.isResponse && !context.evaluate,
          apply: ({context, api, isA, toArray}) => {
            const update = { scope: 'selection' }
            setUpdate(isA, update, toArray(context))
            api.changeState(update)
          }
        },
        {
          where: where(),
          match: ({context, isA}) => isA(context, 'statefulElement_wp') && !context.same && !context.isResponse && !context.evaluate,
          apply: ({context, api, isA, toArray}) => {
            const unit = root(context.marker)
            let scope
            if (context.quantity) {
              scope = context.quantity.quantity
            }
            // TODO set default scope for "every word bold underlined etc"
          }
        },
      ],
      priorities: [
        // { "context": [['underline_wp',0], ['statefulElement_wp', 1], ['thatVerb', 0]], ordered: true, choose: [2] },
        { "context": [['changeState_wp',0], ['statefulElement_wp', 0], ['list', 0]], ordered: true, choose: [0] },
        { "context": [['comparisonWith_wp',0], ['unknown', 0], ['list', 1]], ordered: true, choose: [0] },
      ],
    },
    // "([changeState_wp|make] ([statefulElement_wp]) ([stateValue_wp|]))",
    // "((style_wp/*) [applyStyle_wp] ([statefulElement_wp|]))",
    // "x statefulElement_wp y means y changeState_wp x",
  ]
}

knowledgeModule({ 
  config,
  includes: [ui, countable, colors, errors],
  api: () => new API(),

  module,
  description: 'Word processor',
  test: {
    name: './wp.test.json',
    contents: wp_tests,
    checks: {
      context: [
        ...defaultContextCheck(), 
      ],
      objects: [
        'changeState', 
        { km: 'ui' },
      ],
    },
  },
  template: {
    template,
    instance,
  }
})
