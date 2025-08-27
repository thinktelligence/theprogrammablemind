const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck2 } = require('./helpers')
const dialogues = require('./dialogues')
const javascript_tests = require('./javascript.test.json')

const config = {
  name: 'javascript',
  operators: [
    "((<let> ([variable|])) [assignment|] (value))",
    "(<the> ([variable]))",
    //"(((((console)[.](log))['(']) ([arg]) [')'])"
  ],
  bridges: [
    { "id": "let", "level": 0, "bridge": "{ ...after[0], scope: 'let' }" },
    { "id": "variable", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "assignment", "level": 0, "bridge": "{ ...next(operator), variable: before[0], value: after[0] }" },
  ],
  debug: false,
  version: '3',
  words: {
    "literals": {
      "=": [{"id": "assignment", "initial": "{ value: 1 }" }],
      /*
      " ([0-9]+)": [{"id": "number", "initial": "{ value: int(group[0]) }" }],
      "one": [{"id": "number", "initial": "{ value: 1 }" }],
      "ten": [{"id": "number", "initial": "{ value: 10 }" }],
      */
    }
  },

  hierarchy: [
    ['variable', 'unknown']
  ],

  generators: [
    { 
      where: where(),
      match: ({context}) => context.marker == 'assignment' && context.paraphrase, 
      apply: async ({context, g}) => `let ${await g(context.variable)} = ${await g(context.value)}` 
    },
    { 
      where: where(),
      match: ({context}) => context.marker == 'assignment' && context.isResponse, 
      apply: async ({context, g}) => {
        // const value = await g(context.variable)
        return `${await g(context.variable)} == ${await g(context.value)}` 
      }
    },
  ],

  semantics: [
    {
      where: where(),
      match: ({context}) => context.marker == 'assignment',
      apply: ({context, objects}) => {
        objects.variables[context.variable.value] = context.value.value
        context.isResponse = true
      }
    }
  ],
};

knowledgeModule( { 
  config,
  includes: [dialogues],
  initializer: ({objects, uuid}) => {
    objects.variables = {}
  },

  module,
  description: 'javascript interpreter',
  test: {
    name: './javascript.test.json',
    contents: javascript_tests,
    checks: defaultContextCheck2(),
  },
})
