const { knowledgeModule, where, debug, unflatten, flattens } = require('./runtime').theprogrammablemind
const { defaultContextCheckProperties, defaultContextCheck, words } = require('./helpers')
const _ = require('lodash')
const dialogues = require('./dialogues')
const hierarchy = require('./hierarchy')
const meta = require('./meta')
const concept = require('./concept')
const instance = require('./properties.instance.json')
const properties_tests = require('./properties.test.json')
const { API } = require('./helpers/properties')
const { chooseNumber } = require('./helpers.js')
const pluralize = require('pluralize')

// TODO what is wendy's cat's name
// TODO blue is a colour my eyes are blue what color are my eyes
// TODO for my have a way to set context with current my and its changable
// TODO crew member is a type of person
// TODO captain is a type of job
// TODO do you know any captains / who are the captains
// TODO you hate brocoli do you want some brocoli
//
// TODO the photon torpedoes are armed <- have a learning mode which is more flexible?
// TODO mccoy is a crew member
// TODO status can be armed or not armed (only)
// TODO my -> have a dialog thing
// TODO pretend you are spock what is your name stop pretending what is your name
// TODO who are the crew members / who are they
// TODO the/a means put it in the context for reference
// TODO the crew members are sss                abc are crew members
// TODO who are they / what are they
// TODO kirk: are you a captain
// TODO macro for verb forms -> arm x | go to y | i like x
// TODO READONLY
// TODO pokemon what is the attack/i own a pikachu/ what do i own
// TODO response == true and isResponse == true are mixed do one and not both
// own is xfx owner ownee
/*
V1
   "mccoy's rank is doctor",
   "mccoy is a doctor",

   if class is a value of property then class is a type of property

V2
   "mccoy's rank is doctor",
   infer doctor is a type of rank
*/

// your name is greg  -> greg is value
// you are a captain  -> a captain is class

//
// duck typing: 
//
//   1. Make your properties instances of 'property' add ['myProperty', 'property'] to the hierarchy
//   2. Make your objects an instance of 'object' add ['myObject', 'object'] to the hierarchy
//   3. Add semantics for getting the value
//        [
//          ({objects, context, args, hierarchy}) => 
//                hierarchy.isA(context.marker, 'property') && 
//                args({ types: ['myObjectType'], properties: ['object'] }) && context.evaluate, 
//          ({objects, context}) => {
//          context.value = "value" // set the value here somehow
//          }
//        ],
//

// property value has four cases. 
//   Property has known value                           { has: true, value }
//   Property exists but has unknown value              { has: true }
//   Property exists and the object does not have it    { has: false }
//   Property is not know to exist                      undefined
//
//   value is (has, value)

const api = new API();

// 24 years old -> old indicates that the property is age

function addPropertyMarker(args) {
  return async (property, dimension, markerWordOrWords) => {
    let markerWords = markerWordOrWords
    if (!Array.isArray(markerWordOrWords)) {
      markerWords = [markerWords]
    }

    const { fragments, s, config } = args
    const instance = await fragments("concept is a property", { concept: { marker: property, level: 0, value: property, word: property } })
    await s(instance)
    const propertyMarker = `${property}Marker`
    config.addOperator(`((@<= 'quantity' && context.unit.dimension == ${dimension}) [${propertyMarker}|])`)
    config.addBridge({
      id: propertyMarker,
      words: markerWords,
      isA: ['adjective', 'propertyMarker', 'queryable'],
      enhanced_associations: true,
      initial: { markedProperty: property },
      check: defaultContextCheckProperties(['markedProperty', 'quantity']),
      bridge: `{ 
        ...next(operator),
        quantity: before[0],
        notConjunctableWith: ['quantity'],
        checks: append(before.checks, ['repeats']), 
        propertyType: '${property}', 
        isPropertyValue: true, 
        ${property}: operator, 
        interpolate: append(map(before[0].interpolate, { inside: 'quantity', value: element }), [{ property: '${property}' }]) 
      }`,
    })
  }
}

const config = {
  name: 'properties',
  associations: {
    positive: [
      { context: [["the",0],["unknown",0],["propertyOf",0],["unknown",0],["is",0],["unknown",0]], choose: { index: 4, increment: true } },
      { context: [["objectPrefix",0],["unknown",0]], choose: 1 },
      { context: [["unknown",0],["propertyOf", 0],["unknown",0]], choose: 0 },
    ]
  },

  operators: [
    "([propertyMarker|])",
    "([hierarchyAble|])",
    { pattern: "([propertyRelation|])" }, // , scope: 'development' },
    "(([property]) <([propertyOf|of] ([object]))>)",
    "(<whose> ([property]))",
    "(<howPropertyMarker|how> ([propertyMarker]))",
    "([readonly])", 
    "(<objectPrefix|> ([property]))",
    "(<(([object]) [possession|])> ([property|]))",
    "(([object|]) [have|] ([property|]))",
    "(<doesnt|> ([have/0]))",
    "(([xfx]) <([between] (words))>)",
    // "(([have/1]) <questionMark|>)",
    // the plural of cat is cats what is the plural of cat?
    // does greg have ears (yes) greg does not have ears does greg have ears (no)
    // TODO fix @=unknown does not work?!??
    "((@<= object || @<=unknown) [hasPropertyValue|is,are] (context.isPropertyValue == true))",
  ],
  // TODO remove these and use localHierarchy if needed
  hierarchy: [
    ['unknown', 'hierarchyAble'],
    ['what', 'object'],
  ],
  bridges: [
    {
      where: where(),
      id: 'howPropertyMarker',
      bridge: "{ ...after[0], query: ['what'], how: operator, operator: after[0], interpolate: [ { property: 'how' }, { property: 'operator' } ] }",
    },
    {
      where: where(),
      id: 'hasPropertyValue',
      isA: ['verb'],
      preferOver: ['is'],
      enhanced_associations: true,
      bridge: "{ ...operator, object: before[0], flatten: true, operator: operator, propertyValue: after[0], interpolate: [{ property: 'object' }, { property: 'operator' }, { property: 'propertyValue' }] }",
      semantic: async ({context, s, toArray, fragments, getWordFromDictionary}) => {
        const propertyType = {
          marker: context.propertyValue.propertyType,
          level: 0,
          word: context.propertyValue.propertyType,
          value: context.propertyValue.propertyType,
        }
        for (const object of toArray(context.object)) {
          const instance = await fragments("the property of object is value", { property: propertyType, object, value: context.propertyValue })
          await s(instance)
        }
      }
    },

    { 
      where: where(),
      id: 'propertyRelation', 
      // scope: 'development',
      words: words('propertyRelation'),
      evaluator: ({context, api, objects, toList}) => {
        context.evalue = toList(objects.relations)
        context.evalue.isResponse = true
        context.evalue.paraphrase = false
      }
    },
    { 
      where: where(),
      id: 'propertyMarker', 
    },
    { 
      where: where(),
      id: 'xfx', 
      isA: ['queryable'],
    },
    { 
      where: where(),
      id: 'between', 
      isA: ['preposition'],
      enhanced_associations: false,
      bridge: "{ ...next(operator), arguments: after[0] }" 
    },
    { 
      where: where(),
      id: 'between', level: 1, bridge: "{ ...before[0], arguments: operator.arguments }" },

    { 
      id: 'hierarchyAble', 
      isA: ['queryable'],
    },
    { 
      id: "readonly", 
      isA: ['queryable'],
    },
    // { id: "concept", level: 0, bridge: "{ ...next(operator) }" },
    // the cars dont have wings
    // greg doesnt have wings 
    // { id: "doesnt", level: 0, bridge: "{ ...context, number: operator.number, negation: true }*" },
    // { id: "doesnt", level: 0, bridge: "{ ...context, number: 'one', negation: true }*" },
    { id: "doesnt", level: 0, bridge: "{ ...context, number: operator.number, object.number: operator.number, negation: true }*" },
    { 
      id: "have", 
      level: 0, 
      isA: ['canBeDoQuestion', 'canBeQuestion'],
      localHierarchy: [['property', 'queryable'], ['property', 'theAble'], ['property', 'unknown'], ['object', 'unknown']],
      bridge: "{ ...next(operator), object: { number: operator.number, ...before }, property: after[0], do: { left: 'object', right: 'property' } }" 
    },
    { 
      id: "have", 
      level: 1, 
      localHierarchy: [['property', 'queryable'], ['property', 'theAble'], ['property', 'unknown']],
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "object", 
      isA: ['queryable', 'theAble', 'listable'],
      level: 0, 
    },
    { 
      id: "possession", 
      level: 0, 
      localHierarchy: [['property', 'queryable'], ['property', 'theAble'], ['property', 'unknown'], ['object', 'unknown']],
      inverted: true, 
      bridge: `{ 
        ...next(operator), 
        possession: true, 
        objects: before 
      }` 
    },
    { 
      id: "possession", 
      level: 1, 
      localHierarchy: [['property', 'queryable'], ['property', 'theAble'], ['property', 'unknown'], ['object', 'unknown']],
      inverted: true, 
      bridge: "{ ...after[0], possession: true, objects: append(default(after[0].objects, after), operator.objects), marker: after.marker, types: append(after[0].types, ['property']) }" 
    },
    { 
      id: "propertyOf", 
      level: 0, 
      isA: ['preposition'],
      localHierarchy: [['property', 'queryable'], ['property', 'theAble'], ['property', 'unknown'], ['object', 'unknown']],
      bridge: `{ 
        ...next(operator), 
        ofWord: operator,
        objects: after 
      }` 
    },
    { 
      id: "propertyOf", 
      level: 1, 
      localHierarchy: [['property', 'queryable'], ['property', 'theAble'], ['property', 'unknown']],
      bridge: `{ 
        ...before[0], 
        propertyOf: true, 
        interpolate: [ { values: 'objects', separator: 'of', each: true } ],
        flattenInPlace: [['object', 'objects[1]'], ['value', 'theable', 'objects[0]'] ],
        objects: append(default(before[0].objects, before), operator.objects) 
      }` 
    },
    { 
      id: "whose", 
      level: 0, 
      isA: ['object'],
      bridge: '{ ...after[0], query: true, whose: "whose", modifiers: append(["whose"], after[0].modifiers)}' 
    },
    { 
      id: "objectPrefix", 
      level: 0, 
      localHierarchy: [['property', 'queryable'], ['property', 'theAble'], ['property', 'unknown']],
      bridge: '{ ...after[0], isProperty: true, objects: [after[0], operator] }' 
    },
  ],
  words: {
    literals: {
      "<<possession>>": [{ id: 'possession', initial: "{ value: 'possession' }" }],
      "'s": [{ id: 'possession', initial: "{ value: 'possession' }" }],
      "have": [{ id: 'have', initial: "{ doesable: true, number: 'many' }" }],
      "has": [{ id: 'have', initial: "{ doesable: true, number: 'one' }" }],
      "dont": [{ id: 'doesnt', initial: "{ number: 'many' }" }],
      "doesnt": [{ id: 'doesnt', initial: "{ number: 'one' }" }],
      // "my": [{ id: 'objectPrefix', initial: "{ value: 'other' }" }],
      // "your": [{ id: 'objectPrefix', initial: "{ value: 'self' }" }],
    },
    patterns: [
      { "pattern": ["'s"], defs: [{id: "possession", uuid: '1', initial: "{ value: 'possession' }" }]},
    ],
  },
  priorities: [
    { "context": [['list', 0], ['between', 0], ], "choose": [0] }, 
    { "context": [['list', 1], ['between', 0], ], "choose": [0] }, 
    { "context": [['between', 1], ['is', 0], ], "choose": [0] }, 
    { "context": [['hierarchyAble', 0], ['is', 0], ], "choose": [0] }, 
    { "context": [['hierarchyAble', 0], ['a', 0], ['is', 0], ], "choose": [0] }, 
    { "context": [['does', 0], ['have', 1], ], "choose": [0] }, 
    { "context": [['doesnt', 0], ['does', 0], ['have', 0], ], "choose": [0] }, 
    { "context": [['not', 0], ['is', 0], ['propertyOf', 0], ], "choose": [0] }, 
    { "context": [['objectPrefix', 0], ['is', 0], ['questionMark', 0], ], "choose": [0] }, 
    { "context": [['possession', 0], ['is', 0], ['questionMark', 0], ], "choose": [0] }, 
    { "context": [['possession', 1], ['is', 0], ['questionMark', 0], ], "choose": [0] }, 
    { "context": [['a', 0], ['have', 0], ], "choose": [0] }, 
    { "context": [['have', 0], ['does', 0], ], "choose": [0] }, 
    { "context": [['what', 0], ['is', 0], ['possession', 0], ['propertyOf', 0], ], "choose": [0] }, 
    { "context": [['possession', 1], ['is', 0], ], "choose": [0] }, 
    { "context": [['objectPrefix', 0], ['is', 0], ], "choose": [0] }, 
    { "context": [['property', 0], ['is', 0], ['what', 0], ['propertyOf', 0], ['article', 0], ], "choose": [0] }, 
    { "context": [['propertyOf', 1], ['is', 0], ], "choose": [0] }, 
    { "context": [['article', 0], ['propertyOf', 0], ], "choose": [0] }, 
    { "context": [['property', 0], ['article', 0], ['propertyOf', 0], ], "choose": [0] }, 
    { "context": [['have', 0], ['questionMark', 0], ], "choose": [0] }, 
    { "context": [['have', 0], ['questionMark', 0], ['have', 1], ['is', 1], ], "choose": [0] }, 
    { "context": [['what', 0], ['is', 0], ['objectPrefix', 0], ], "choose": [0] }, 
  ],
  generators: [
    {
      where: where(),
      // match: ({context}) => context.marker == 'propertyRelation' && !context.paraphrase,
        // paraphrase: evaluate propertyrelation
        // response: 23 years old of bob is 23 years old
      match: ({context}) => context.marker == 'propertyRelation',
        // paraphrase: evaluate object's property
        // response: bob's age is 23 years old
      match: ({context}) => context.marker == 'propertyRelation' && context.isResponse,
      apply: async ({context, gp, fragments}) => {
        const instance = await fragments("the property of object", {
          property: { ...context.property, interpolate: undefined },
          object: context.object
        })
        return await gp(instance)
      }
    },
    {
      notes: 'ordering generator for response',
      match: ({context}) => (context.orderingArgs && Object.keys(context.orderingArgs).length !== 0) && context.evalue && context.isResponse,
      apply: async ({context, s, g, km, flatten}) => {
        const brief = km("dialogues").api.getBrief()

        let { evalue } = context
        let yesno = ''
        let hasVariables = false
        if (context.focusable) {
          for (const f of context.focusable) {
            if (context[f].query) {
              hasVariables = true
              break
            }
          }
        }

        if (evalue.truthValueOnly || context.truthValueOnly || context.wantsTruthValue || !hasVariables) {
          function any(value, test) {
            if (test(value)) {
              return true
            }
            const values = flatten(['list'], value)
            for (const value of values) {
              if (test(value)) {
                return true
              }
            }
          }
          if (any(evalue, (value) => value.truthValue)) {
            yesno = 'yes'
          } else if (evalue.truthValue === false || context.truthValueOnly) {
            yesno = 'no'
          }
        }
        if (evalue.truthValueOnly) {
          return `${yesno}`
        } else {
          if (context.voice) {
            evalue = await s({ ...evalue, toVoice: context.voice, flatten: false})
          }

          const details = await g(Object.assign({}, evalue, { paraphrase: true }))
          if (yesno) {
            return `${yesno} ${details}`
          }
          else {
            return details
          }
        }
      }
    },

    {
      match: ({context}) => {
        if (context.do && context.paraphrase) {
          const left = context['do'].left
          if (context[left]) {
            // who owns X should not be 'does who own x' but instead 'who owns x'
            if (context[left].query) {
              return true;
            }
          }
        }

        return false;
      },

      apply: async ({context, g, gw}) => {
        const chosen = await(gw({ number: context.number, word: context.word, isVerb: true}))
        return `${await g(context[context.do.left])} ${chosen} ${await g(context[context.do.right])}`
      }
    },

    {
      match: ({context}) => context.isEd,
      apply: async ({context, g}) => {
        const chosen = chooseNumber(context[context.afterTag], 'is', 'are')
        if (context[context.beforeTag].evalue && context[context.beforeTag].evalue.marker == 'answerNotKnown') {
          return await g(context[context.beforeTag])
        }
        return `${await g(context[context.afterTag])} ${chosen} ${context.word} by ${await g(context[context.beforeTag])}`
      }
    },

    {
      notes: 'generator for constraint',
      match: ({context}) => context.paraphrase && context.constrained,
      apply: async ({callId, context, g}) => {
        if (context[context.beforeTag].marker == 'by') {
          // the cat wendy owned
          return `${await g({...context[context.afterTag], paraphrase: true})} ${context.word} ${await g({...context[context.beforeTag], paraphrase: true})}`
        } else {
          // the cat owned by wendy
          return `${await g({...context[context.afterTag], paraphrase: true})} ${context.word} ${['by', await g({...context[context.beforeTag], paraphrase: true})].filter((t) => t).join(' ')}`
        }
      },
    },


    {
      notes: 'expression with constraints',
      where: where(),
      match: ({context}) => context.constraints && context.paraphrase,
      apply: async ({context, g}) => {
        // TODO assume one constaints deal with more in the future
        const constraint = context.constraints[0]
        const constrained = Object.assign({}, constraint.constraint)
        const property = Object.assign({}, context)
        delete property.constraints

        constrained[constraint.property] = property
        constrained.paraphrase = true
        const paraphrase = Object.assign({}, constraint.paraphrase)
        paraphrase.paraphrase = true;
        paraphrase[constraint.property] = property
        return await g(constrained)
      },
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'xfx',
      apply: async ({context, g}) => `${context.word} between ${await g(context.arguments)}`
    },
    {
      notes: 'add possession ending',
      priority: -1, 
      where: where(),
      match: ({context}) => context.paraphrase && context.possessive,
      apply: async ({context, g}) => {
        context.possessive = false
        const phrase = await g(context)
        context.possessive = true
        if (phrase.endsWith('s')) {
          return `${phrase}'`
        } else {
          return `${phrase}'s`
        }
      }
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'objectPrefix' && context.value == 'other' && context.paraphrase,
      apply: ({context}) => `my`
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'objectPrefix' && context.value == 'other',
      apply: ({context}) => `your`
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'objectPrefix' && context.value == 'self' && context.paraphrase,
      apply: ({context}) => `your`
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'objectPrefix' && context.value == 'self',
      apply: ({context}) => `my`
    },
    {
      notes: 'negative do questions',
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'canBeDoQuestion') && context.paraphrase && context.negation,
      apply: async ({context, g}) => {
        return `${await g(context[context.do.left])} doesnt ${pluralize.plural(context.word)} ${await g(context[context.do.right])}`
      },
    },
    {
      notes: 'do questions',
      // debug: 'call9',
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'canBeDoQuestion') && context.paraphrase && context.query && context.do,
      apply: async ({context, g}) => {
        const right = context['do'].right
        if (context[right].query) {
            const left = context['do'].left
            return `${await g(context[right])} ${chooseNumber(context[right], "does", "do")} ${await g(context[left])} ${context.word}`
        } else {
          // the marker is the infinite form
          return `${chooseNumber(context[context.do.left], "does", "do")} ${await g(context[context.do.left])} ${context.marker} ${await g(context[context.do.right])}`
        }
      },
    },
    {
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'canBeDoQuestion') && context.paraphrase && !context.query && !context.interpolate,
      apply: async ({context, g}) => {
        return `${await g(context.object)} ${context.word} ${await g(context.property)}`
      }
    },
    {
      notes: 'the property of object',
      where: where(),
      // match: ({context}) => context.paraphrase && context.modifiers && context.object, 
      match: ({context}) => context.paraphrase && !context.possession && context.object && !context.interpolate, 
      apply: async ({context, g, gs}) => {
               const base = { ...context }
               base.object = undefined;
               if (context.object.marker == 'objectPrefix') {
                 return `${await g(context.object)} ${await g(base)}`
               } else {
                 if (context.objects) {
                   const gObjects = []
                   for (const object of context.objects) {
                     gObjects.push(await g({...object, paraphrase: true}))
                   }
                   return await gs(gObjects, ' of ')
                 } else {
                   // TODO make paraphrase be a default when paraphrasing?
                   return `${await g(base)} of ${await g({...context.object, paraphrase: true})}`
                 }
               }
             },
    },
    {
      // ({context, hierarchy}) => hierarchy.isA(context.marker, 'property') && context.object && !context.value && !context.evaluate,
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'property') && context.object && !context.possession && !context.evaluate && !context.object.marker == 'objectPrefix',
      apply: async ({context, g}) => {
        const property = Object.assign({}, context, { object: undefined })
        return `${await g(property)} of ${await g({ ...context.object, paraphrase: true })}`
      }
    },
    {
      notes: "object's property",
      where: where(),
      // match: ({context}) => context.paraphrase && !context.modifiers && context.object, 
      match: ({context}) => !context.modifiers && (context.object || context.objects) && !context.interpolate, 
      apply: async ({context, g, gs}) => {
        if (context.evalue) {
          return await g(context.evalue)
        } else if (context.objects) {
          const objects = [ ...context.objects ]
          objects.reverse()
          let phrase = ''
          let separator = ''
          for (let i = 0; i < objects.length-1; ++i) {
            phrase = phrase + separator + await g({...objects[i], paraphrase: context.paraphrase, possessive: true})
            separator = ' '
          }
          phrase = phrase + separator + await g({...objects[objects.length-1], paraphrase: context.paraphrase})
          return phrase
        } else {
          const base = { ...context }
          base.object = undefined; // TODO make paraphrase be a default when paraphrasing?
          if (context.object.marker == 'objectPrefix') {
            return `${await g(context.object)} ${await g(base)}`
          } else {
            return `${await g({...context.object, paraphrase: context.paraphrase})}'s ${await g(base)}`
          }
        }  
      },
    },
  ],
  semantics: [
    {
      notes: 'unify for properties',
      where: where(),
      match: ({context, isA}) => 
        context.evaluate && 
        context.marker == 'unify' && 
        context.terms?.some((term) => {
          return term.objects && isA(term.objects[0], 'property') && term.query
        }),
      apply: async (args) => {
        const {context, km, callId, api, resolveEvaluate} = args
        let value, property, object
        if (context.terms[0].query) {
          property = context.terms[0].objects[0]
          object = context.terms[0].objects[1]
          value = context.terms[1]
        } else {
          property = context.terms[1].objects[0]
          object = context.terms[1].objects[1]
          value = context.terms[0]
        }
        const pattern = {
          marker: 'propertyRelation',
          object,
          property,
          value,
        }
        const relations = await api.relation_unify(pattern, ['object', 'property', 'value'])
        resolveEvaluate(context, relations)
      }
    },
    {
      notes: 'getter for relation based verbs',
      match: ({context}) => context.relationBacked && context.query,
      apply: ({context, km, callId}) => {
        const api = km('properties').api
        context.evalue = {
          marker: 'list',
          listable: true,
          // value: unflatten(api.relation_get(context, before.concat(after).map( (arg) => arg.tag ) ))
          value: unflatten(api.relation_get(context, context.relationArgs.map( (arg) => arg.tag ) ))
        }
        context.evalue.isResponse = true
        context.isResponse = true
        if (context.evalue.value.length == 0) {
          context.evalue.marker = 'answerNotKnown';
          context.evalue.listable = true
          context.evalue.value = [];
        } else {
          // context.evalue.truthValue = true
        }
      }
    },

    {
      notes: `setter for relation based verbs`,
      match: ({context}) => context.relationBacked && !context.toVoice && !context.evaluate,
      apply: ({context, km, hierarchy, config, stack}) => {
        const api = km('properties').api
        // add types for arguments
        for (const argument of context.focusable || []) {
          const value = api.toValue(context[argument])
          if (value) {
            const minimas = hierarchy.minima(context[argument].types)
            for (const type of minimas) {
              if (config.exists(value)) {
                config.addHierarchy(value, type);
              }
            }
          }
        }
        api.relation_add(context)
      }
    },
    {
      notes: 'ordering query',
      match: ({context}) => context.query && (context.orderingArgs && Object.keys(context.orderingArgs).length !== 0),
      apply: ({context, km}) => {
        const api = km('ordering').api
        const propertiesAPI = km('properties').api
        context.ordering = context.orderingArgs.name
        const matches = propertiesAPI.relation_get(context, ['ordering', context.orderingArgs.object, context.orderingArgs.category])
        if (matches.length > 0 || (typeof context.query == 'boolean' && context.query)) {
          // does greg like bananas
          if (matches.length == 0) {
            const response = _.clone(context)
            response.isResponse = true
            response.query = undefined
            context.evalue = { marker: 'list', listable: true, value: [response] }
          } else {
            context.evalue = { marker: 'list', listable: true, value: unflatten(matches) }
            context.evalue.isResponse = true
          }
          context.evalue.truthValue = matches.length > 0
          context.evalue.truth = { marker: 'yesno', value: matches.length > 0, isResponse: true, focus: true }
          context.evalue.focusable = ['truth']
          if (!context.evalue.truthValue) {
            context.evalue.truthValueOnly = true
          }

          // ADD this line back and remove it to check
          // context.response = { marker: 'list', listable: true, value: [response], isResponse: true }
          // Object.assign(context, { marker: 'list', listable: true, value: responses, focusable: ['value'], paraphrase: true, truthValue: matches.length > 0 })
        } else {
          // see if anything is preferred greg
          // what does greg like
          const matches = propertiesAPI.relation_get(context, ['ordering', context.orderingArgs.object])
          if (matches.length == 0) {
            // Object.assign(context, { marker: 'idontknow', query: _.clone(context) })
            context.evalue = { marker: 'idontknow', query: _.clone(context), isResponse: true }
          } else {
            context.evalue = { marker: 'list', listable: true, value: matches, isResponse: true }
          }
          context.isResponse = true
          context.evalue.truthValue = matches.length > 0 && matches[0].marker == context.orderingArgs.marker
        }
      }
    },

    {
          notes: 'ordering setter',
        // TODO use hierarchy for operator
        // match: ({context}) => context.marker == operator,
        match: ({context}) => (context.orderingArgs && Object.keys(context.orderingArgs).length !== 0),
        apply: ({context, km, stack}) => {
          const propertiesAPI = km('properties').api
          context.ordering = context.orderingArgs.name
          const fcontexts = flattens(['list'], [context])
          for (const fcontext of fcontexts) {
            fcontext.paraphrase = true
            fcontext[context.orderingArgs.object].paraphrase = true
            fcontext[context.orderingArgs.category].paraphrase = true
          }
          propertiesAPI.relation_add(fcontexts)
        }
    },
    {
      notes: 'semantic for setting value with constraint',
      //match: ({context, isA}) => isA(context.marker, after[0].tag) && context.evaluate && context.constraints,
      match: ({context, isA}) => context.evaluate && context.constraints,
      apply: async ({km, context, e, log, isA}) => {
        const constraint = context.constraints[0];
        const value = constraint.constraint;
        let property = constraint.property;
        const properties = constraint.properties;
        for (const p of properties) {
          if (value[p].concept) {
            property = p
            // constraint.property = p; // set what is used
            constraint.property = {...constraint.property, ...p}; // set what is used

          }
        }
        // value.marker = 'owns'
        // value.greg = true
        // value.ownee.query = true
        value.query = true
        value.greg99 = 23
        const instance = await e(value)
        if (instance.verbatim) {
          context.evalue = { verbatim: instance.verbatim }
          return
        }
        if (instance.evalue.marker == 'answerNotKnown') {
          context.evalue = instance.evalue
          return
        }
        const selected = instance.evalue.value.map( (r) => r[property] )
        context.constraints = undefined;
        context.evalue = { marker: 'list', listable: true, value: selected }
      },
    },
    {
      where: where(),
      notes: "how deep is the pool",
      priority: -1,
      match: ({context}) => context.marker == 'is' && (context.one.how || context.two.how),
      apply: async ({ resolveEvaluate, g, context, toArray, toList, fragments, kms, e, toEValue }) => {
        const propertyMarkerContext = context.one
        let object = context.two
        if (context.two.how) {
          propertyMakerContext = context.two
          object = context.one
        }
        const pmcs = toArray(propertyMarkerContext)
        const properties = []
        for (const pmc of pmcs) {
          const property = pmc.markedProperty
          properties.push({ marker: property, value: property, word: property })
        }
        const propertyOfObject = await fragments("the property of object", { property: toList(properties, true), object })
        const value = toEValue(await e(propertyOfObject))
        value.focusableForPhrase = true
        propertyOfObject.focusableForPhrase = false
        const response = await fragments("the property is value", { property: propertyOfObject, value })
        response.isResponse = true
        resolveEvaluate(context, response) 
      }
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'same' && context.one.marker == 'concept',
      apply: async (args) => {
        const {context} = args
        await args.makeObject({ ...args, context: context.two})
        context.sameWasProcessed = true
      }
    },
    {
      // TODO maybe use the dialogue management to get params
      notes: 'wants is xfx between wanter and wantee',
      where: where(),
      match: ({context}) => context.marker == 'same' && context.two.marker == 'xfx',
      // debug: 'call3',
      apply: ({context, km, config}) => {
        const papi = km('properties').api
        const { one, two } = context
        const singular = pluralize.singular(one.word)
        const plural = pluralize.plural(one.word)
        const args = two.arguments.value;
        papi.createBinaryRelation(config, singular, [singular, plural], args[0].word, args[1].word)
      },
      priority: -1,
    },
    {
      notes: 'marking something as readonly',
      where: where(),
      match: ({context}) => context.marker == 'same' && context.two.marker == 'readonly',
      apply: ({context, km, objects}) => {
        km('properties').api.setReadOnly([context.one.value]) 
        context.sameWasProcessed = true
      }
    },
    /*
        "objects": {
        "greg": {
          "age": {
            "marker": "unknown",
            "types": [
              "unknown"
            ],
            "unknown": true,
            "value": "23",
            "word": "23",
            "response": true
          }
        }
    */
    {
      notes: 'crew members. evaluate a concepts to get instances',
      where: where(),
      match: ({context, hierarchy, api, isA}) => 
                          hierarchy.isA(context.marker, 'concept') && ((!context.propertyOf && !context.isProperty) || isA(context.objects[context.objects.length-1], 'dimension')) &&
                          (!context.pullFromContext || context.number == 'many') &&
                          context.evaluate &&
                          !(context.types || []).includes('property') &&
                          // !context.value &&  // greghere
                          !context.ordinal &&
                          (!context.objects || context.objects.length !== 2 || !context.objects[1].isInstance) &&
                          (api.objects && api.objects.children && api.objects.children[context.marker]) &&
                          !context.evaluate.toConcept,
      apply: ({context, hierarchy, objects, api, km}) => {
        const values = api.objects.children[context.marker]
        const phrases = values.map( (value) => km('concept').api.getWordForValue(value) )
        // context.focusableForPhrase = true
        context.hierarchy = true
        context.evalue = { 
          marker: 'list', 
          listable: true,
          // value: api.objects.children[context.marker]
          value: phrases,
        }
      }
    },
    {
      notes: 'greg has eyes',
      where: where(),
      match: ({context}) => context.marker == 'have' && !context.query,
      apply: ({context, objects, api}) => {
        if (context.object.unknown) {
          context.object.value = pluralize.singular(context.object.value)
        }
        if (context.property.unknown) {
          context.property.value = pluralize.singular(context.property.value)
        }
        if (context.negation) {
          api.setProperty(context.object, context.property, null, false)
        } else {
          api.setProperty(context.object, context.property, null, true)
        }
        // TODO delete this?
        context.sameWasProcessed = true
      }
    },
    {
      notes: 'greg has eyes?',
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'have') && context.query,
      apply: async ({context, g, api, objects}) => {
        const object = pluralize.singular(context.object.value);
        const property = pluralize.singular(context.property.value);
        context.isResponse = true
        if (!await api.knownObject(object)) {
          context.verbatim = `There is no object named ${await g({...context.object, paraphrase: true})}`
          return
        }
        if (!await api.hasProperty(object, property)) {
          context.evalue = {
            marker: 'yesno', 
            value: false,
          }
        } else {
          context.evalue = {
            marker: 'yesno', 
            value: true,
          }
          return
        }
      }
    },
    {
      notes: 'set the property of an object',
      where: where(),
      // TODO change disable${uuid} to callOnce
      match: (args) => args.callOnce(args, 'properties.1', ({context, hierarchy, uuid}) => 
        context.marker == 'same' && 
        hierarchy.isA(context.one.marker, 'property') && 
        context.one.objects),
      apply: async (args) => {
        const {context, fragments, objects, km, api, log, s, uuid} = args
        const objectContext = context.one.objects[context.one.objects.length-1];
        const propertyContext = context.one.objects[0];
        // const propertyContext = context.one;
        if (objectContext.unknown) {
          objectContext.value = pluralize.singular(objectContext.value)
        }
        const objectId = objectContext.value

        await api.makeObject({ ...args, context: objectContext })
        await api.makeObject({ ...args, context: propertyContext })
        const propertyId = propertyContext.value
        try {
          api.setProperty(objectContext, propertyContext, context.two, true)
          context.sameWasProcessed = true
        } catch (e) {
          log(`Error processing set property of an object: ${e}`)
          const config = km('properties')
          const value = await api.getProperty(objectId, propertyId)
          if (value?.value == context.two?.value) {
            context.evalue = [
              { marker: 'yesno', value: true, paraphrase: true },
            ]
            context.isResponse = true
            context.sameWasProcessed = true
          } else {
            const mappings = {
              property1: { word: propertyContext.word, value: propertyContext.value, paraphrase: true },
              object1: { word: objectContext.word, value: objectContext.value, paraphrase: true },
              value1: value,
            }
            // run the query 'the property of object' then copy that here and template it
            context.evalue = [
              { marker: 'yesno', value: false, paraphrase: true },
            ]
            context.evalue = context.evalue.concat(await fragments("the property1 of object1 is value1", mappings))
            context.evalue.forEach( (r) => r.paraphrase = true )
            context.isResponse = true
            context.sameWasProcessed = true
          }
        }
      }
    },
    {
      notes: 'get/evaluate a property',
      where: where(),
      match: ({context, hierarchy, toArray}) => {
        return (toArray(context).every((value) => hierarchy.isA(value.marker, 'property')) || (hierarchy.isA(context.marker, 'list') && context.possession)) && context.evaluate && context.objects && !context.evaluate.toConcept
      },
      // match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'property') && context.evaluate,
      apply: async ({debug, isA, hierarchy, getWordFromDictionary, flatten, asList, context, api, kms, objects, g, gp, s, log, recall}) => {
        async function toValue(objectContext) {
          if (!objectContext.value) {
            return objectContext;
          }
          let objectValue = kms.stm.api.getVariable(objectContext);
          if (!objectValue) {
            objectValue = objectContext.value
          }
          if (!await api.knownObject(objectValue)) {
            objectContext.verbatim = `There is no object named "${await g({...objectContext, paraphrase: true})}"`
            return
          }
          return objectValue
        }

        async function processOne(toDo) {
          let currentContext = toDo.pop()
          let currentValue = await toValue(currentContext)
          while (toDo.length > 0) {
            const nextContext = toDo.pop()
            const nextValue = await toValue(nextContext)
            if (!nextValue) {
              // TODO maybe this I aware so it can say "I don't know about blah..." and below
              // if (currentContext.unknown || !currentContext.value) {
              if (!api.conceptExists(currentContext.value)) {
                // api.conceptExists(currentContext)
                const objectPhrase = await g({...currentContext, paraphrase: true})
                context.verbatim = `What "${objectPhrase}" means is unknown`
                return
              }

              const propertyPhrase = await g({...nextContext, paraphrase: true})
              const objectPhrase = await g({...currentContext, paraphrase: true})
              context.verbatim = `There is no interpretation for "${propertyPhrase} of ${objectPhrase}"`
              return
            }

            let fromMentions
            if (!await api.knownProperty(currentContext, nextContext)) {
              if (hierarchy.isA(nextValue, 'property_type')) {
                const types = hierarchy.froms(nextValue)
                for (const type of types) {
                  if (isA(currentContext, type)) {
                    fromMentions = getWordFromDictionary({ value: type })
                  }
                }
              }
              if (!fromMentions) {
                fromMentions = await recall({ context: nextContext, all: nextContext.number == 'many', frameOfReference: currentContext })
              }
              if (!fromMentions) {
                if (!currentValue && currentContext.unknown) {
                  context.verbatim = `What "${await gp(currentContext)}" means is unknown`
                } else {
                  context.verbatim = `There is no property ${await g({...nextContext, paraphrase: true})} of ${await g({...currentContext, paraphrase: true})}`
                }
                return
              }
            }
            if (fromMentions) {
              currentContext = fromMentions
              currentValue = fromMentions // TODO not sure what is right here so just do something and fix when actually needed SOP
            } else {
              currentContext = await api.getProperty(currentValue, nextValue)
              currentValue = currentContext.value
            }
          }
          return currentContext
        }

        // const toDo = [ ...context.objects ]
        const toDos = flatten(['list'], context.objects)
        const results = []
        for (const toDo of toDos) {
          const one = await processOne(toDo)
          if (one) {
            results.push(one)
          }
        }

        if (results.length > 0) {
          context.focusable = ['object[0]']
          // context.evalue = currentContext
          context.evalue = asList(results, true)
          context.object = undefined;
        } else {
          context.evalue = { marker: 'answerNotKnown' }
          context.object = undefined;
        }
      }
    }
  ]
};

function initializer({objects, config, isModule}) {
  config.addArgs((args) => ({
    makeObject: args.api('properties').makeObject,
    addPropertyMarker: addPropertyMarker(args),
  }))
}

const template = {
  fragments: [
    "the property1 of object1 is value1",
    "the property of object is value",
    "the property of object",
    "the property is value",
  ],
  configs: [
    "property is a concept",
    { query: "concept is a property", isFragment: true },
    config,
    // "property type is an compound noun",
    {
      operators: [
        "([property_type|])",
      ],
      bridges: [
        {
          id: 'property_type',
          isA: ['theAble'],
          words: words('property type')
        },
      ],
    },
  ],
}


knowledgeModule( { 
  config: { name: 'properties' },
  api: () => new API(),
  includes: [concept, meta, dialogues],
  initializer,

  module,
  description: 'properties of objects',
  test: {
    name: './properties.test.json',
    contents: properties_tests,
    checks: {
      context: [
        defaultContextCheck({ marker: 'property', exported: true, extra: ['objects'] }),
        defaultContextCheck({ marker: 'possession', exported: true, extra: ['objects'] }),
        defaultContextCheck({ marker: 'propertyOf', exported: true, extra: ['object', 'objects'] }),
        defaultContextCheck({ marker: 'objectPrefix', exported: true, extra: ['object', 'objects'] }),
        defaultContextCheck()
      ],
      /*
      objects: [
        'relations'
      ]
      */
    },
    include: {
      words: true,
      operators: true,
      bridges: true,
    }
  },
  instance,
  template,
})
