const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const tokenize_tests = require('./tokenize.test.json')

const config = {
  name: 'tokenize',
  operators: [
    "([unknown])",
    "([listable])",
  ],
  bridges: [
    { id: "unknown", level: 0, bridge: "{ ...operator, unknown: true, dead: true }" },
    { id: "listable", },
  ],
  words: {
    patterns: [
      { 
        pattern: [{ type: 'space' }, { repeat: true, is_space: true }], 
        defs: [ { remove: true } ] 
      },
      { 
        pattern: [{ type: 'alphanumeric' }, { repeat: true }], 
        scale: 0.8, 
        check_spelling: true, 
        is_unknown: true, 
        allow_partial_matches: false, 
        defs: [ 
          { id: 'unknown', initial: "{ value: text, unknown: true }" } 
        ] 
      },
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

const initializer = ({objects, config, isModule}) => {
  config.addArgs(
    ({addPattern}) => ({
      addSuffix: (suffix) => {
        addPattern({
          pattern: [{ type: 'alphanumeric' }, { repeat: true }, { end: true }, { suffix: true }, suffix],
          scale: 0.8,
          allow_partial_matches: false,
          defs: [{id: "unknown", uuid: '1', initial: "{ value: text, unknown: true }" }]
        })
      }
    })
  )
}

knowledgeModule( { 
  config,
  initializer,

  module,
  description: 'tokenize',
  test: {
    name: './tokenize.test.json',
    contents: tokenize_tests,
    checks: {
      context: [
        defaultContextCheck({ marker: 'unknown', exported: true, extra: ['marker', 'text', 'value'] }),
        defaultContextCheck(),
      ],
    },
  },
})
