const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const gdefaults = require("./gdefaults")
const tests = require('./errors.test.json')

const config = {
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
      apply: async ({context, g, gp, verbatim, contexts}) => {
        const argument = contexts.find( (argument) => argument.argument_id == context.interpretation_error.argument_id )
        debugger
        verbatim(`Did not know how to understand "${await gp(argument)}" when applying "${await g(context)}"`)
      }
    },
    {
      match: ({context}) => context.context?.interpretation_error,
      apply: async ({context, g, gp, verbatim, contexts}) => {
        context = context.context
        debugger
        const argument = contexts.find( (argument) => argument.argument_id == context.interpretation_error.argument_id )
        verbatim(`Did not know how to understand "${await gp(argument)}" when applying "${await g(context)}"`)
      }
    },
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
