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

*/

class API {
  initialize({ objects }) {
    this._objects = objects
  }

  changeColor(unit, scope, color) {
    this._objects.changeColor = { unit, scope, color }
  }
}

const api = new API()

let config = {
  name: 'wp',
  operators: [
    // TODO write a parser for this so I can use statefulElement as the id
    "([changeState|make] ([statefulelement]) ([stateValue|]))",
  ],
  bridges: [
    { 
      id: 'changeState',
      parents: ['verb'],
      bridge: "{ ...next(operator), element: after[0], state: after[1], operator: operator, generate: ['operator', 'element', 'state'] }",
      semantic: ({api, context}) => {
        debugger
        const unit = context.element.marker
        const scope = context.element.quantity.quantity
        const color = context.state.value
        api.changeColor({ unit, scope, color })
      }
    },
    { 
      id: 'statefulelement',
    },
    { 
      id: 'stateValue',
      children: ['color_colors'],
    },
  ],
  semantics: [
  ]
};

template = {
  configs: [
    'words are countable and statefulElements',
    'characters are countable',
    'paragraphs are countable',
  ],
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
        'changeColor', 
        { km: 'ui' },
      ],
    },
  },
  template: {
    template,
    instance,
  }
})
