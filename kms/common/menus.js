const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const ui = require('./ui')
const menus_tests = require('./menus.test.json')
const menus_instance = require('./menus.instance.json')

class API {
  initialize({ objects }) {
    this._objects = objects
  }

  move(direction, steps = 1, units = undefined) {
    this._objects.move = { direction, steps, units }
  }

  select(item) {
    this._objects.select = { item }
  }

  unselect(item) {
    this._objects.unselect = { item }
  }

  cancel(direction) {
    this._objects.cancel = true
  }

  stop(action) {
    this._objects.stop = action
  }
}

const config = {
  name: 'menus',
};

const template = {
  fragments: [
  ],
}

knowledgeModule({ 
  config,
  includes: [ui],
  api: () => new API(),

  module,
  description: 'Control menues with speech',
  test: {
    name: './menus.test.json',
    contents: menus_tests,
    checks: {
      objects: ['move', 'select', 'unselect', 'cancel', 'stop'],
      context: defaultContextCheck(['operator', 'direction', 'moveable']),
    },
  },
  template: {
    template,
    instance: menus_instance
  }
})
