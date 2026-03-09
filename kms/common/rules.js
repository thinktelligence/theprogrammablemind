const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const formulas = require('./formulas.js')
const tests = require('./rules.test.json')
const instance = require('./rules.instance.json')

const config = {
  name: 'rules',
  operators: [
    // TODO notations like (([arg1:]) [op] ([arg2:nameOfArg2}|word1])) -> just make the bridge + operators. put this in the bridge def / also calculate generators
    "((pattern) [ruleMapping|] (pattern))",
  ],
  semantics: [
  ],
  bridges: [
    {
      where: where(),
      id: 'ruleMapping', 
      words: ['=>'],
      isA: ['queryable'],
      after: ['pattern'],
      bridge: "{ ...next(operator), left: before[0], right: after[0], operator: operator, interpolate: [{ property: 'left' }, { property: 'operator' }, { property: 'right' }] }",
      semantic: ({context}) => {
      }
    },
  ]
};

const template = {
  configs: [
    "patterns and rules are concepts",
    {
      hierarchy: [
        ['equals', 'pattern'],
      ],
    },
    config,
  ]
}

knowledgeModule({ 
  config: { name: 'rules' },
  includes: [formulas],

  module,
  description: 'Deducing from rules',
  instance,
  template,
  test: {
    name: './rules.test.json',
    contents: tests,
    checks: {
      objects: [
        'rules',
      ],
      context: [
        defaultContextCheck(),
      ]
    }
  },
})
