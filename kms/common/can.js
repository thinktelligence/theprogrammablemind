const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const hierarchy = require("./hierarchy")
const tests = require('./can.test.json')
const instance = require('./can.instance.json')

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
    // "([can] (canableAction && context.infinitive))",
    "([dorf])",
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
      id: 'dorf',
      semantic: async ({config, s, context}) => {
        const before = config.config.objects.processed[0].context
        before.toPassive = true
        await s(before)
        debugger
        context.evalue = before.evalue
      }
    },
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
        { "apply": true, "bridge": "{ ...context, passive: true, interpolate: [context.interpolate[2], { word: { marker: 'canPassive' } }, { word: { marker: 'beCanPassive' } }, context.interpolate[1], { word: { marker: 'byCanPassive' } }, context.interpolate[0]] }", "set": "context" },
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
        { "apply": true, "bridge": "{ ...context, passive: true, interpolate: [context.interpolate[0], { word: { marker: 'canPassive' } }, context.interpolate[2], { word: { marker: 'beCanPassive' } }, context.interpolate[1], { word: { marker: 'byCanPassive' } }] }", "set": "context" },
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
  semantics: [
    {
      match: ({context}) => context.toPassive,
      apply: async ({g, context, fragmentMapper}) => {
        if (context.passive) {
          return
        }
        const mapper = await fragmentMapper(['canobject', 'canVerb', 'cansubject'], "canobject can be canverb by cansubject", "cansubject can canverb canobject")
        debugger
        const passive = mapper.instantiate([context])[0]
        const string = await g(passive)
        console.log(string)
        context.isResult = true
        context.evalue = passive
        console.log(JSON.stringify(passive, null, 2))
      }
    },
  ],
};

const template = {
  fragments: [
    "canobject can be canverb by cansubject",
    "cansubject can canverb canobject",
  ],

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
      const api = apis('properties')
      api.createActionPrefix({
        before: [{tag: 'canSubject', id: 'canSubject'}],
        operator: 'canVerb',
        after: [{tag: 'canObject', id: 'canObject'}],
        relation: true,
        flatten: true,
        can: true,
        create: [
          {
            id: 'canVerb',
          },
          'canObject', 
          'canSubject'
        ],
        localHierarchy: [
          ['unknown', 'canObject'],
          ['unknown', 'canSubject'],
        ],
        config,
      })
    },
    async ({fragments, addWordToDictionary}) => {
      const fragment = await fragments("canobject can be canverb by cansubject")
      // only run after rebuild template
      if (fragment) {
        const context = fragment.contexts()[0]
        addWordToDictionary(context.be)
        addWordToDictionary(context.by)
        addWordToDictionary(context.can)
      }
    },
  ]
}

knowledgeModule( { 
  config,
  includes: [hierarchy],

  module,
  description: 'talk about what can be done',
  test: {
    name: './can.test.json',
    contents: tests,
    checks: {
      context: [
        defaultContextCheck({ extra: ['can', 'evalue', 'makeable', 'maker', 'operator', 'interpolate', 'number', 'property', 'word'] }),
      ],
    },
  },
  template: {
    template,
    instance,
  },

})
