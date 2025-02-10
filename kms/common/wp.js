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
      if (style == 'underlined') {
        style = 'underline'
      }
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

template = {
  configs: [
    'setidsuffix _wp',
    'words are countable and statefulElements',
    'characters are countable',
    'paragraphs are countable',
    'bold, italic, code and underlined are styles',
    // 'styles are negatable',
    "resetIdSuffix",
    {
      operators: [
        // TODO write a parser for this so I can use statefulElement as the id
        "([changeState_wp|make] ([statefulElement_wp]) ([stateValue_wp|]))",
      ],
      bridges: [
        { 
          id: 'changeState_wp',
          parents: ['verb'],
          bridge: "{ ...next(operator), element: after[0], state: after[1], operator: operator, generate: ['operator', 'element', 'state'] }",
          localHierarchy: [
            ['thisitthat', 'statefulElement_wp'],
            ['everything', 'statefulElement_wp'],
          ],
          semantic: ({api, isA, context, toArray}) => {
            let unit = root(context.element.marker)
            let scope
            if (isA(context.element, 'everything')) {
              scope = 'all'
            } else {
              scope = context.element.quantity.quantity
            }
            const update = { unit, scope }
            setUpdate(isA, update, toArray(context.state))
            api.changeState(update)
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
