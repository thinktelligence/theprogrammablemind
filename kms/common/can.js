const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const hierarchy = require("./hierarchy")
const can_tests = require('./can.test.json')
const can_instance = require('./can.instance.json')

/*
you can make these coffees -> list of coffees
the coffees you can make are list of coffees
fred can fly these planes.
what can you make?
what can fred fly?
you can order a product
you can modify a document
what can you do
what can you do with a document
i order a product

fred bob and stan can make coffee
fred can make capucino bob americano and stan lattes
ask someone to make me an americano
who do I ask to make an american

have a way to convert from active to passive

DONE what can fred make
DONE can bob make coffee

DONE coffee can be made by joe
DONE who can coffee be made by
DONE who can make coffee and tea

DONE can bob make coffee
DONE what can bob make
*/

const config = {
  name: 'can',
  operators: [
    "((*) [canableAction] (*))",
    "(<canStatement|can> (canableAction/0))",
    "(<canQuestion|can> (canableAction/1))",
    // what can joe make
    "((*) [whatCanQuestion|can] (*) (canableAction))",
    // who can coffee be made by
    "((*) [whatCanQuestionPassive|can] (*) ([beCanPassive|be]) (canableAction) ([byCanPassive|by]))",
    "((*) [canPassive|can] ([beCanPassive|be]) (canableAction) ([byCanPassive|by]) (*))",
  ],
  bridges: [
    { id: 'beCanPassive' },
    { id: 'byCanPassive' },
    { 
      id: "canableAction",
      isA: ['verb'],
    },
    { 
      id: "canStatement",
      before: ['verb'],
      bridge: "{ ...after[0], can: operator, verb: after[0], interpolate: [{ property: 'can' }, { property: 'verb', context: { number: 'one' } }]}",
    },
    { 
      id: "canQuestion",
      before: ['verb'],
      // bridge: "{ ...after[0], operator.number: 'infinitive', truthValueOnly: true, query: true, can: operator, arg1: [{ property: 'can' }], interpolate: append([{ property: 'can'}], after[0].interpolate)}",
      bridge: "{ ...after[0], operator.number: 'infinitive', truthValueOnly: true, query: true, can: operator, interpolate: append([{ property: 'can'}], after[0].interpolate)}",
    },
    { 
      // "((*) [canPassive|can] ([beCanPassive|be]) (canableAction) ([byCanPassive|by]) (*))",
      id: "canPassive",
      before: ['verb'],
      bridge: [
        // { "apply": true, "bridge": "{ ...after[1], can: operator, operator: after[1], interpolate: [{ property: 'can' }, { property: 'operator' }] }", "set": "operator" },
        { "apply": true, "bridge": "{ ...after[1], can: operator, be: after[0], operator: after[1], by: after[2] }", "set": "operator" },
        {
          "rewire": [
            { "from": 'before[0]', "to": 'after[0]' },
            { "from": 'after[3]', "to": 'before[0]' },
          ]
        },
        { "apply": true, "operator": "operator", "set": "context" },
        { "apply": true, "bridge": "{ ...context, passive: true, interpolate: [context.interpolate[2], { property: 'can' }, { property: 'be' }, context.interpolate[1], { property: 'by' }, context.interpolate[0]] }", "set": "context" },
        // { "apply": true, "bridge": "{ ...context, interpolate: [context.interpolate[2], context.interpolate[0], context.interpolate[1]] }", set: "context" },
      ],
    },
    { 
      // "((*) [whatCanQuestionPassive|can] (*) ([beCanPassive|be]) (canableAction) ([byCanPassive|by]))",
      id: "whatCanQuestionPassive",
      before: ['verb'],
      bridge: [
        // { "apply": true, "bridge": "{ ...after[1], can: operator, operator: after[1], interpolate: [{ property: 'can' }, { property: 'operator' }] }", "set": "operator" },
        { "apply": true, "bridge": "{ ...after[2], can: operator, be: after[1], operator: after[2], by: after[3] }", "set": "operator" },
        { "apply": true, "operator": "operator", "set": "context" },
        { "apply": true, "bridge": "{ ...context, passive: true, interpolate: [context.interpolate[0], { property: 'can' }, context.interpolate[2], { property: 'be' }, context.interpolate[1], { property: 'by' }] }", "set": "context" },
        // { "apply": true, "bridge": "{ ...context, interpolate: [context.interpolate[2], context.interpolate[0], context.interpolate[1]] }", set: "context" },
      ],
    },
    { 
      id: "whatCanQuestion",
      before: ['verb'],
      bridge: [
        // { "apply": true, "bridge": "{ ...after[1], can: operator, operator: after[1], interpolate: [{ property: 'can' }, { property: 'operator' }] }", "set": "operator" },
        { "apply": true, "bridge": "{ ...after[1], can: operator, operator: after[1] }", "set": "operator" },
        {
          "rewire": [
            { "from": 'before[0]', "to": 'after[0]' },
            { "from": 'after[0]', "to": 'before[0]' },
          ]
        },
        { "apply": true, "operator": "operator", "set": "context" },
        { "apply": true, "bridge": "{ ...context, operator.number: 'infinitive', interpolate: [context.interpolate[2], { property: 'can' }, context.interpolate[0], context.interpolate[1]] }", "set": "context" },
        // { "apply": true, "bridge": "{ ...context, interpolate: [context.interpolate[2], context.interpolate[0], context.interpolate[1]] }", set: "context" },
      ],
    },
  ],
};

const template = {
  configs: [
    ({isProcess, isTesting, testModuleName, apis, config, addHierarchy}) => {
      if (isProcess || isTesting) {
        const api = apis('properties')
        api.createActionPrefix({
          before: [{tag: 'maker', id: 'maker'}],
          operator: 'make',
          after: [{tag: 'makeable', id: 'makeable'}],
          relation: true,
          flatten: true,
          can: true,
          create: [
            {
              id: 'make',
              infinitive: 'make',
            },
            'makeable', 
            'maker'
          ],
          localHierarchy: [
            ['unknown', 'maker'],
            ['unknown', 'makeable'],
          ],
          config,
        })
      }
    }
  ]
}

knowledgeModule( { 
  config,
  includes: [hierarchy],

  module,
  description: 'talk about what can be done',
  test: {
    name: './can.test.json',
    contents: can_tests,
    checks: {
      context: [
        defaultContextCheck({ extra: ['can', 'evalue', 'makeable', 'maker', 'operator', 'interpolate', 'number', 'property'] }),
      ],
    },
  },
  template: {
    template,
    instance: can_instance,
  },

})
