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
  start inserting text until I say banana
  ...
  or 
  stop inserting text

  make the text of the 1st to 3rd paragraphs blue


  make every word bold and underlines and blue -> weirdly "bold underlined and blue" works

  make the font ... 
  make the color blue
  make the color of the first paragraph blue

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
  if (isA(context.element, 'everything')) {
    scope = 'all'
  } else if (context.element.condition) {
    const condition = context.element.condition
    if (condition.marker == 'start_wp') {
      const letters = condition.letters.letters.text
      conditions.push({ comparision: 'prefix', letters })
    }
  } else {
    scope = context.element.quantity.quantity
  }
  const update = { unit, scope, conditions }
  setUpdate(isA, update, toArray(context.state))
  api.changeState(update)
}

template = {
  configs: [
    'setidsuffix _wp',
    'words are countable and statefulElements',
    'characters are countable',
    'paragraphs are countable',
    'bold, italic, code, capitalize, lowercase and underline are styles',
    'underlined means underline',
    'capitalized means capitalize',
    'uppercase means capitalize',
    'italicize means italic',
    'italicized means italic',
    // 'styles are negatable',
    "resetIdSuffix",
    {
      operators: [
        // TODO write a parser for this so I can use statefulElement as the id
        "(<thatVerb|that> (verb/0))",
        "([changeState_wp|make] ([statefulElement_wp]) ([stateValue_wp|]))",
        "((style_wp/*) [applyStyle_wp] ([statefulElement_wp|]))",
        "((word_wp/*) [start_wp] ([startsWith_wp|with] (a/0)? (letters)))",
      ],
      bridges: [
        { 
          id: 'thatVerb',
          // before: ['verb'],
          bridge: "{ ...after[0], verb: after[0], that: operator, generate: ['that', 'verb'], localPriorities: { before: [\"verb\"] }, bridge_override: { operator: after[0].marker, bridge: '{ ...bridge.subject, postModifiers: [\"condition\"], condition: bridge }' } }",
          /*
          semantic: (args) => {
            changeState({...args, element: args.context.element, state: args.context.state})
          }
          */
        },
        { 
          id: 'start_wp',
          parents: ['verb'],
          words: ['start', 'starts'],
          bridge: "{ ...next(operator), element: before[0], subject: before[0], letters: after[0], verb: operator, generate: ['element', 'verb', 'letters'] }",
          /*
          semantic: (args) => {
            changeState({...args, element: args.context.element, state: args.context.state})
          }
          */
        },
        { 
          id: 'startsWith_wp',
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
        { "context": [['changeState_wp',0], ['statefulElement_wp', 0], ['list', 0]], ordered: true, choose: [0] },
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
