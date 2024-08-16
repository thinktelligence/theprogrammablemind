const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const tokenize_tests = require('./tokenize.test.json')

let configStruct = {
  name: 'tokenize',
  words: {
    patterns: [
      { pattern: [{ type: 'space' }, { repeat: true }], defs: [ { remove: true } ] },
    // self.add_trie_pattern(['space', Repeat()], TrieDef('remove', 'remove'))
/*
    if ('unknown', 0) in self.operator_key_to_operator:
      unknown = self.operator_key_to_operator[('unknown', 0)]
      self.add_trie_pattern(['alphanumeric', Repeat()], TrieDef('unknown', 'unknown', unknown))
    else:
      self.add_trie_pattern(['alphanumeric', Repeat()], TrieDef('unknown', 'unknown'))
    self.add_trie_pattern(['space', Repeat()], TrieDef('remove', 'remove'))
*/
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
      ...`~!@#$%^&*()_+-=[]{}\\|;:,<>/?'"`.split("").map((punctuation) => { return { child: punctuation, parent: 'punctuation' } }),
    ],
  },
};

createConfig = () => new Config(configStruct, module)

knowledgeModule( { 
  module,
  createConfig,
  description: 'tokenize',
  test: {
    name: './tokenize.test.json',
    contents: tokenize_tests,
    checks: {
            context: defaultContextCheck,
    },
  },
})
