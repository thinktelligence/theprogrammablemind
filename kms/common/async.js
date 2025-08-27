const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const tokenize = require('./tokenize.js')
const tests = require('./async.test.json')
const instance = require('./async.instance.json')

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// i told the times so that the tests would fail
const config = {
  name: 'async',
  operators: [
    "([a])",
    "([evaluate] (a/*))",
  ],
  bridges: [
    { 
      "id": "a", 
      "level": 0, 
      "bridge": "{ ...next(operator) }",
      evaluator: ({context}) => {
        context.evalue = true
      }
    },
    { 
      "id": "evaluate", 
      "level": 0, 
      "bridge": "{ ...next(operator), arg: after[0] }",
      semantic: async ({context, e}) => {
        context.valueFromE = await e(context.arg)
      },
      generatorp: ({context}) => {
        return `${context.word} arg == ${JSON.stringify(context.valueFromE)}`
      },
    },
  ],
  generators: [
    { 
      match: async ({context}) => {
        await sleep(500)
        return context.marker == 'a' && context.paraphrase
      },
      apply: async ({context}) => {
        await sleep(500)
        return `aGenerated`
      },
    },
    { 
      match: async ({context}) => {
        await sleep(500)
        return context.marker == 'a' && context.isResponse
      },
      apply: async ({context}) => {
        await sleep(500)
        return `aGeneratedResponse`
      },
    },
  ],
  semantics: [
    { 
      match: async ({context}) => {
        await sleep(500)
        return context.marker == 'a'
      },
      apply: async ({context}) => {
        await sleep(1000)
        context.value = 23
        context.isResponse = true
      }
    },
  ],
};

const template = {
  configs: [
  ]
}

knowledgeModule( { 
  config,
  includes: [tokenize],

  module,
  description: 'testing that async works',
  template: { template, instance },
  test: {
    name: './async.test.json',
    contents: tests,
    checks: defaultContextCheck(),

  },
})
