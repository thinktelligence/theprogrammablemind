const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const tokenize_tests = require('./tokenize.test.json')

const config = {
  name: 'tokenize',
  operators: [
    "([unknown])",
  ],
  bridges: [
    { id: "unknown", level: 0, bridge: "{ ...next(operator), unknown: true, dead: true }" },
    { id: "unknown", level: 1, bridge: "{ ...next(operator) }" },
  ],
  words: {
    patterns: [
      { pattern: [{ type: 'space' }, { repeat: true }], defs: [ { remove: true } ] },
      { pattern: [{ type: 'alphanumeric' }, { repeat: true }], defs: [ { id: 'unknown', initial: "{ value: text, unknown: true }" } ] },
    ],
    hierarchy: [
      { child: ' ', parent: 'space' },
      ..."0123456789".split("").map((digit) => { return { child: digit, parent: 'digit' } }),
      { child: 'lower', parent: 'letter' }, 
      { child: 'upper', parent: 'letter' },
      ...'abcdefghijklmnopqrstuvwxyz'.split("").map((letter) => { return { child: letter, parent: 'lower' } }),
      ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split("").map((letter) => { return { child: letter, parent: 'upper' } }),
      { child: 'letter', parent: 'alphanumeric' },
      { child: 'digit', parent: 'alphanumeric' },
      { child: '_', parent: 'alphanumeric' },
      ...`~!@#$%^&*()+-=[]{}\\|;:,<>/?'"`.split("").map((punctuation) => { return { child: punctuation, parent: 'punctuation' } }),
    ],
  },
};

knowledgeModule( { 
  config,

  module,
  description: 'tokenize',
  test: {
    name: './tokenize.test.json',
    contents: tokenize_tests,
    checks: {
            context: defaultContextCheck,
    },
  },
})
