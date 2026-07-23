const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const tests = require('./askfor.test.json')
const instance = require('./askfor.instance.json')
const base = require('./length')

// if you know the name and address of a person do such and such

const template = {
  configs: [
    "setidsuffix _askfor",
    {
      operators: [
        "([askfor|] (<for> (@<= concept)))",
      ],
      bridges: [
        {
          id: 'askfor',
          isA: ['verb'],
          words: ['ask'],
          bridge: `{
            ...next(operator),
            properties: after[0],
            interpolate: [{ self: true }, { property: 'properties' }]
          }`,
        }
      ],
    },
    "resetIdSuffix",
  ],
}

knowledgeModule( { 
  config: { name: 'askfor' },
  includes: [base],

  module,
  description: 'asking the system to interact with a user and find out information',
  test: {
    name: './askfor.test.json',
    contents: tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
  instance,
  template,
})
