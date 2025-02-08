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
*/

class API {
  initialize({ objects }) {
    this._objects = objects
  }

  changeState(value) {
    this._objects.changeState = value
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
    'bold, italic and underlined are styles',
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
            ['thisitthat', 'statefulElement'],
          ],
          semantic: ({api, isA, context, toArray}) => {
            const unit = context.element.marker
            const scope = context.element.quantity.quantity
            let color;
            const styles = []
            const update = { unit, scope }
            for (const state of toArray(context.state)) {
              if (isA(state, 'style_wp')) {
                if (!update.styles) {
                  update.styles = []
                }
                update.styles.push(state.value.split('_')[0])
              } else {
                update.color = state.value.split('_')[0]
              }
            }
            api.changeState(update)
          }
        },
        { 
          id: 'stateValue_wp',
          children: ['color_colors', 'style_wp'],
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
