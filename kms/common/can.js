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
what can fred make
can bob make coffee
who can make coffee and tea

can you make coffee
what can you make
*/

const config = {
  name: 'can',
  operators: [
    // "([can] (canableAction && context.infinitive))",
    "((*) [canableAction] (*))",
    "(<canStatement|can> (canableAction/0))",
    "(<canQuestion|can> (canableAction/1))",
    "((*) [whatCanQuestion|can] (*) (canableAction))"
    /*
      bridge: [
        // b=[do] o=c a=[s, ca]
        apply operator { ...after[1], can } to operator
        // b=[do] o=[ca+c] a=[s, ca]
        rewire before[0] -> after[0] + after[0] -> before[0]
        // b=[s] o=[ca+c] a=[do, ca]
        apply operator
      ]
    */
    // Bridge('{ ...before }'-(Rewire before[0] to after[0] Set after to [ListableType(Listable(Type('likee')))]), '{ ...next(operator), likee*: after[0], liker: before[0] }')
  ],
  associations: {
    positive: [
      // { context: [['what', 0], ['whatCanQuestion', 0], ['unknown', 0], ['make', 0]], choose: 1 },
      // { context: [['what', 1], ['whatCanQuestion', 0], ['unknown', 0], ['make', 0]], choose: 1 },
    ],
  },
  bridges: [
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
      bridge: "{ ...after[0], operator.number: 'infinitive', truthValueOnly: true, query: true, can: operator, arg1: [{ property: 'can' }], interpolate: append([{ property: 'can'}], after[0].interpolate)}",
    },
    { 
      id: "whatCanQuestion",
      before: ['verb'],
      bridge: [
        { "apply": true, "bridge": "{ ...after[1], can: operator }", "set": "operator" },
        {
          "rewire": [
            { "from": 'before[0]', "to": 'after[0]' },
            { "from": 'after[0]', "to": 'before[0]' },
          ]
        },
        { "apply": true, "operator": "operator", "set": "context" },
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
          create: [
            {
              id: 'make',
              infinitive: 'make',
              isA: ['canableAction'],
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
        // config.addAssociation({ context: [['what', 0], ['whatCanQuestion', 0], ['unknown', 0], ['make', 0]], choose: 1 })
        // config.addAssociation({ context: [['what', 1], ['whatCanQuestion', 0], ['unknown', 0], ['make', 0]], choose: 1 })
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
      context: [defaultContextCheck()],
    },
  },
  template: {
    template,
    instance: can_instance,
  },

})
