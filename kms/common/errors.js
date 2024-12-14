const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const gdefaults = require("./gdefaults")
const tests = require('./errors.test.json')

let config = {
  name: 'errors',
  operators: [
    { pattern: "([drop] ([dropable]))", development: true },
  ],
  bridges: [
    { 
      id: "drop", 
      bridge: "{ ...next(operator), arg: after[0] }", 
      development: true
    },
    { id: "dropable", development: true },
  ],
  semantics: [
    {
      match: ({context}) => context.interpretation_error,
      apply: async ({context, g, verbatim, contexts}) => {
        debugger
        const argument = contexts.find( (argument) => argument.argument_id == context.interpretation_error.argument_id )
        verbatim(`Did not know how to ${await g(context)}, ${await g(argument)}`)
      }
    }
  ],
};

knowledgeModule({ 
  config,
  includes: [gdefaults],

  module,
  description: 'handling of surfaceable errors',
  test: {
    name: './errors.test.json',
    contents: tests,
    /*
    checks: {
            context: [
              ...defaultContextCheck(), 
              { 
                property: 'quantity', 
                filter: ['marker', 'value'],
              },
              { 
                property: 'pieces', 
                filter: [
                  'marker', 'text',
                  { property: 'count', filter: ['marker', 'value'] },
                ] 
              }]
          },
    */
  },
})
