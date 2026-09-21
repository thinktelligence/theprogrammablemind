const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const tests = require('./debug.test.json')
const instance = require('./debug.instance.json')
const tokenize = require('./tokenize')

const template = {
  configs: [
    {
      operators: [
        "([setdebugbreak] (*))",
        "([debugger] (*))",
      ],
      bridges: [
        { 
          id: 'setdebugbreak',
          bridge: `{
            ...next(operator),
            tag: after[0]
          }`,
          semantic: ({context, debug}) => {
            debug.hit(context.tag.word)
          }
        },
        {
          id: 'debugger',
          semantic: (args) => {
            debugger // eslint-disable-line no-debugger
            debugger // eslint-disable-line no-debugger
          },
        },
      ],
    },
  ],
}

knowledgeModule( { 
  config: { name: 'debug' },
  includes: [tokenize],

  module,
  description: 'sending debug commands',
  test: {
    name: './debug.test.json',
    contents: tests,
  },
  instance,
  template,
})
