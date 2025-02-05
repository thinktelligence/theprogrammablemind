const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const helpers = require("./helpers")
const ui = require("./ui")
const countable = require("./countable")
const wp_tests = require('./wp.test.json')
const instance = require('./wp.instance.json')

let config = {
  name: 'wp',
  operators: [
  ],
  bridges: [
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
