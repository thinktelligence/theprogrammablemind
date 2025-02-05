const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const helpers = require("./helpers")
const ui = require("./ui")
const countable = require("./countable")
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
}

const api = new API()

let config = {
  name: 'wp',
  operators: [
  ],
  bridges: [
  ],
  semantics: [
  ]
};

template = {
  configs: [
    'words are countable',
    'characters are countable',
    'paragraphs are countable',
  ],
}

knowledgeModule({ 
  config,
  includes: [ui, countable],
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
      objects: [{ km: 'ui' }],
    },
  },
  template: {
    template,
    instance,
  }
})
