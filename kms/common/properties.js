const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require('./dialogues')
const meta = require('./meta')
const concept = require('./concept')
const properties_instance = require('./properties.instance.json')
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

const template = {
  fragments: [
    "the property1 of object1 is value1",
  ],
}

const api = new API();

const config = {
  name: 'properties',
  associations: {
    positive: [
      { context: [["the",0],["unknown",0],["propertyOf",0],["unknown",0],["is",0],["unknown",0]], choose: 4 },
    ]
  },

  operators: [
    "([hierarchyAble|])",
    "(([property]) <([propertyOf|of] ([object]))>)",
    "(<whose> ([property]))",
    // "((modifier) [modifies] (concept))", 
    // "([concept])",
    "([readonly])", 
    "(<objectPrefix|> ([property]))",
    "(<(([object]) [possession|])> ([property|]))",
    "(([object|]) [have|] ([property|]))",
    "(<doesnt|> ([have/0]))",
    "(([xfx]) <([between] (words))>)",
    // "(([have/1]) <questionMark|>)",
    // the plural of cat is cats what is the plural of cat?
    // does greg have ears (yes) greg does not have ears does greg have ears (no)
  ],
  /*
    [('is', 0), ('property', 0)]-('property', 0)


    got from -> 
    ['property', 'queryable']
    "(([queryable]) [is|is,are] ([queryable|]))"

    <> implies output is property/1 so that should be used to put propertyOf/0 below property/1
    "(([property]) <([propertyOf|of] ([object]))>)",
  */
  hierarchy: [
    // ['concept', 'theAble'],
    // ['concept', 'queryable'],
    ['unknown', 'hierarchyAble'],
    // ['unknown', 'object'],
    ['what', 'object'],
    // ['hierarchyAble', 'queryable'],
    // ['readonly', 'queryable'],
    // ['object', 'queryable'],
    // ['xfx', 'queryable'],
  
    // ['property', 'queryable'],
    // ['property', 'theAble'],
    // ['property', 'unknown'],
 
    // ['object', 'theAble'],
    // ['whose', 'object'],
    // ['have', 'canBeDoQuestion'],
    // ['have', 'canBeQuestion'],
  ],
  bridges: [
    { 
      id: 'xfx', 
      isA: ['queryable'],
    },
    { 
      id: 'between', 
      isA: ['preposition'],
      bridge: "{ ...next(operator), arguments: after[0] }" 
    },
    { id: 'between', level: 1, bridge: "{ ...before[0], arguments: operator.arguments }" },

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
      id: "property", 
      words: ['properties'],
      isA: ['queryable', 'theAble'],
      level: 0, 
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
      bridge: "{ ...next(operator), possession: true, object: before[0], objects: before }" 
    },
    // greg44 { id: "possession", level: 1, inverted: true, bridge: "{ ...after[0], object: operator.object, possession: true, objects: append(default(after[0].objects, after), operator.objects), marker: operator('property', 0) }" },
    { 
      id: "possession", 
      level: 1, 
      localHierarchy: [['property', 'queryable'], ['property', 'theAble'], ['property', 'unknown'], ['object', 'unknown']],
      inverted: true, 
      bridge: "{ ...after[0], object: operator.object, possession: true, objects: append(default(after[0].objects, after), operator.objects), marker: after.marker, types: append(after[0].types, ['property']) }" 
    },
    // TODO make object be after[0] that makes more sense
    // { id: "possession", level: 1, inverted: true, bridge: "{ ...after[0], object: after[0], objects: append(default(after[0].objects, after), operator.objects), marker: operator('property', 0) }" },

    { 
      id: "propertyOf", 
      level: 0, 
      isA: ['preposition'],
      localHierarchy: [['property', 'queryable'], ['property', 'theAble'], ['property', 'unknown'], ['object', 'unknown']],
      bridge: "{ ...next(operator), object: after[0], objects: after }" 
    },
    { 
      id: "propertyOf", 
      level: 1, 
      localHierarchy: [['property', 'queryable'], ['property', 'theAble'], ['property', 'unknown']],
      bridge: "{ ...before[0], object: operator.object, objects: append(default(before[0].objects, before), operator.objects) }" 
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
      bridge: '{ ...after[0], object: operator, objects: [after[0], operator] }' 
    },
  ],
  words: {
    literals: {
      "<<possession>>": [{ id: 'possession', initial: "{ value: 'possession' }" }],
      " 's": [{ id: 'possession', initial: "{ value: 'possession' }" }],
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
        if (false && context.isResponse) {
          return await g({...constraint.paraphrase, paraphrase: true})
        } else {
          return await g(constrained)
        }
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
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'canBeDoQuestion') && context.paraphrase && !context.query,
      apply: async ({context, g}) => {
        return `${await g(context.object)} ${context.word} ${await g(context.property)}`
      }
    },
    {
      notes: 'the property of object',
      where: where(),
      // match: ({context}) => context.paraphrase && context.modifiers && context.object, 
      match: ({context}) => context.paraphrase && !context.possession && context.object, 
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
      match: ({context}) => !context.modifiers && context.object, 
      apply: async ({context, g, gs}) => {
               if (context.objects) {
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
      where: where(),
      match: ({context}) => context.marker == 'concept' && context.same,
      apply: ({context, km, config}) => {
        const api = km('properties').api
        api.makeObject({ config, context: context.same })
        context.sameWasProcessed = true
      }
    },
    {
      // TODO maybe use the dialogue management to get params
      notes: 'wants is xfx between wanter and wantee',
      where: where(),
      match: ({context}) => context.same && context.same.marker == 'xfx',
      // debug: 'call3',
      apply: ({context, km, config}) => {
        const papi = km('properties').api
        const singular = pluralize.singular(context.word)
        const plural = pluralize.plural(context.word)
        const args = context.same.arguments.value;
        papi.createBinaryRelation(config, singular, [singular, plural], args[0].word, args[1].word)
      },
      priority: -1,
    },
    {
      notes: 'marking something as readonly',
      where: where(),
      match: ({context}) => context.marker == 'readonly' && context.same,
      apply: ({context, km, objects}) => {
        km('properties').api.setReadOnly([context.same.value]) 
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
      match: ({context, hierarchy, api}) => 
                          hierarchy.isA(context.marker, 'concept') && 
                          context.evaluate &&
                          !(context.types || []).includes('property') &&
                          // !context.value &&  // greghere
                          (api.objects && api.objects.children && api.objects.children[context.marker]) &&
                          !context.evaluate.toConcept,
      apply: ({context, objects, api, km}) => {
        const values = api.objects.children[context.marker]
        const phrases = values.map( (value) => km('concept').api.getWordForValue(value) )
        // context.focusableForPhrase = true
        context.hierarchy = true
        context.evalue = { 
          marker: 'list', 
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
        if (context.negation) {
          api.setProperty(pluralize.singular(context.object.value), pluralize.singular(context.property.value), null, false)
        } else {
          api.setProperty(pluralize.singular(context.object.value), pluralize.singular(context.property.value), null, true)
        }
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
      // match: ({context}) => context.marker == 'property' && context.same && context.object,
      match: ({context, hierarchy, uuid}) => hierarchy.isA(context.marker, 'property') && context.same && context.objects && !context[`disable${uuid}`],
      apply: async ({context, fragments, objects, km, api, log, s, uuid}) => {
        const objectContext = context.object;
        const propertyContext = context;
        const objectId = context.object.value
        // const propertyId = context.value
        /*
        const propertyId = context.marker
        if (context.marker != context.value) {
        }
        */
        // const propertyId = context.marker
        /*
        // greg HERE
        */
        propertyContext[`disable${uuid}`] = true
        const propertyId = (await km("dialogues").api.evaluateToConcept(propertyContext, context, log, s)).evalue;
        try{
          // greg
          // api.makeObject({config, context: objectContext, doPluralize: false})
          // api.addWord(propertyContext)
          // api.addWord(objectContext)
          // propertyContext.objects = null;
          api.setProperty(pluralize.singular(objectId), pluralize.singular(propertyId), context.same, true)
          context.sameWasProcessed = true
        } catch (e) {
          log(`Error processing set property of an object: ${e}`)
          const config = km('properties')
          const fragment = fragments("the property1 of object1 is value1")
          const value = await api.getProperty(objectId, propertyId)
          if (value.value == context.same.value) {
            context.evalue = [
              { marker: 'yesno', value: true, paraphrase: true },
            ]
            context.isResponse = true
            context.sameWasProcessed = true
          } else {
            const mappings = [
              {
                where: where(),
                match: ({context}) => context.value == 'property1',
                apply: ({context}) => Object.assign(context, { word: propertyContext.word, value: propertyContext.value, paraphrase: true }),
              },
              {
                where: where(),
                match: ({context}) => context.value == 'object1',
                apply: ({context}) => {
                  Object.assign(context, { word: objectContext.word, value: objectContext.value, paraphrase: true })
                },
              },
              {
                where: where(),
                match: ({context}) => context.value == 'value1',
                apply: ({context}) => Object.assign(context, value),
              },
            ]
            // run the query 'the property of object' then copy that here and template it
            context.evalue = [
              { marker: 'yesno', value: false, paraphrase: true },
            ]
            context.evalue = context.evalue.concat(await fragment.instantiate(mappings))
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
      match: ({context, hierarchy}) => 
                      hierarchy.isA(context.marker, 'property') && 
                      context.evaluate && 
                      context.objects &&
                      !context.evaluate.toConcept, // && !context.value,
                      // greghere
      // match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'property') && context.evaluate,
      apply: async ({context, api, kms, objects, g, s, log}) => {
        const toDo = [ ...context.objects ]

        const toValue = async (objectContext) => {
          if (!objectContext.value) {
            return objectContext;
          }
          const objectValue = kms.stm.api.getVariable(objectContext.value);
          if (!await api.knownObject(objectValue)) {
            context.verbatim = `There is no object named "${await g({...objectContext, paraphrase: true})}"`
            return
          }
          return objectValue
        }

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

          if (!await api.knownProperty(currentContext, nextContext)) {
            context.verbatim = `There is no property ${await g({...nextContext, paraphrase: true})} of ${await g({...currentContext, paraphrase: true})}`
            return
          }
          currentContext = await api.getProperty(currentValue, nextValue, g)
          currentValue = currentContext.value
        }
        context.focusable = ['object[0]']
        context.evalue = currentContext
        context.object = undefined;
      }
    }
  ]
};

knowledgeModule( { 
  config,
  api: () => new API(),
  includes: [concept, meta, dialogues],

  module,
  description: 'properties of objects',
  test: {
    name: './properties.test.json',
    contents: properties_tests,
    checks: {
      context: defaultContextCheck(),
      /*
      objects: [
        'children', 
        'concept', 
        'parents', 
        'properties'
      ]
      */
    },
    include: {
      words: true,
      operators: true,
      bridges: true,
    }
  },
  template: {
    template,
    instance: properties_instance,
  },
})
