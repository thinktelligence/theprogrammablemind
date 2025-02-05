const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const properties = require('./properties')
const hierarchy_tests = require('./hierarchy.test.json')
const pluralize = require('pluralize')
const _ = require('lodash')
const { isMany } = require('./helpers')

const getTypes = ( km, concept, instance ) => {
  const propertiesAPI = km('properties').api;
  const conceptAPI = km('concept').api;
  const digraph = propertiesAPI.digraph;
  const intersect = (set1, set2) => {
    return new Set([...set1].filter(x => set2.has(x)))
  }
  const descendants = digraph.descendants(concept.value)
  const ancestors = digraph.ancestors(instance.evalue)
  const common = intersect(ancestors, descendants)
  const answer = Array.from(digraph.minima(common))
  const words = answer.map( (value) => conceptAPI.getWordForValue(value) )
  for (const word of words) {
    word.paraphrase = true
  }
  instance = {
    marker: 'list', 
    value: words,
    paraphrase: true,
  }
  instance.focus = true
  return instance
}

// TODO the types of rank are x y z ....
// TODO x is a kind of y
let config = {
  name: 'hierarchy',
  operators: [
    // "([hierarchyAble|])",
    "([type|type,types])",
  ],
  bridges: [
    // // { id: 'hierarchyAble', level: 0, bridge: "{ ...next(operator) }" },
    // { id: 'type', level: 0, bridge: "{ ...next(operator), value: 'type' }" },
    { id: 'type' },
  ],
  hierarchy: [
    // ['unknown', 'hierarchyAble'],
    // ['hierarchyAble', 'queryable'],
    ['type', 'property'],
    ['type', 'whatAble'],
    ['have', 'canBeQuestion'],
    ['have', 'canBeDoQuestion'],
  ],
  priorities: [
    { "context": [['isEd', 0], ['is', 0], ], "choose": [1] },
    { "context": [['a', 0], ['questionMark', 0], ['is', 0], ], "choose": [0] },
    // [['is', 0], ['hierarchyAble', 0]],
    // [['a', 0], ['is', 0], ['hierarchyAble', 0]],
  ],
  semantics: [
    {
      notes: 'what type is pikachu',
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.query && !['what'].includes(context.one.marker) && !['what'].includes(context.two.marker) && (context.one.query || context.two.query),
      apply: async ({context, hierarchy, km, log, e}) => {
        const one = context.one;
        const two = context.two;
        let concept, value;
        if (one.query) {
          concept = one;
          value = two;
        } else {
          concept = two;
          value = one;
        }
        let instance = await e(value)
        if (instance.verbatim) {
          context.evalue = { verbatim: instance.verbatim }
          context.isResponse = true
          return
        }
        instance = getTypes(km, concept, instance)

        concept = _.cloneDeep(value)
        concept.isQuery = undefined

        const many = isMany(concept) || isMany(instance)
        context.evalue = {
          "default": true,
          "marker": "is",
          "one": concept,
          "two": instance,
          "focusable": ['two', 'one'],
          "word": many ? "are" : "is",
          "number": many ? "many" : undefined,
        }
        context.isResponse = true
      },
    },
    {
      // type of pikachu        what is the type of pikachu -> this one
      // name of pikachu        what is the name of pikachu -> properties
      // types of job           what are the types of animals -> next one
      notes: 'type of pikachu',  // the types of type is the next one
      where: where(),
      match: ({context}) => context.marker == 'type' && context.evaluate && context.object && context.objects[context.objects.length-1].number == 'one' && pluralize.isSingular(context.objects[0].word),
      apply: async ({context, objects, e, gs, km, log}) => {
        const concept = context.objects[0];
        const value = context.objects[1];
        let instance = await e(value)
        if (instance.verbatim) {
          context.evalue = { verbatim: instance.verbatim }
          return
        }
        instance = getTypes(km, concept, instance)
        context.evalue = instance
        if (context.evalue.value.length > 1) {
          context.number = 'many'
        }
      }
    },

    {
      notes: 'is x y',
      // debug: 'call2',
      where: where(),
      match: ({context, hierarchy, args}) => {
        if ((context.one && context.one.constraints) || (context.two && context.two.constraints)) {
          return false
        }
        if (context.query && context.query.includes && !context.query.includes(context.marker)) {
          return false
        }
        return hierarchy.isA(context.marker, 'is') && context.query && args( { types: ['hierarchyAble', 'hierarchyAble'], properties: ['one', 'two'] } )
      },
      apply: async ({context, km, objects, g}) => {
        const api = km('properties').api
        const one = context.one
        const two = context.two
        const oneId = pluralize.singular(one.value);
        if (!api.conceptExists(oneId)) {
          context.evalue = {
            verbatim: `I don't know about ${await g({ ...one, paraphrase: true})}` 
          }
          context.isResponse = true
          return
        }
        const twoId = pluralize.singular(two.value);
        if (!api.conceptExists(twoId)) {
          context.evalue = {
            verbatim: `I don't know about ${await g({ ...two, paraphrase: true})}` 
          }
          context.isResponse = true
          return
        }
        context.evalue = {
          marker: 'yesno',
          value: api.isA(oneId, twoId)
        }
        context.isResponse = true
      }
    },
    {
      notes: 'c is a y',
      where: where(),
      match: ({context, listable}) => listable(context.marker, 'hierarchyAble') && !context.pullFromContext && !context.wantsValue && context.same && !context.same.pullFromContext && context.same.wantsValue,
      apply: ({context, km, objects, asList, baseConfig : config}) => {
        const api = km('properties').api
        // mark c as an instance?
        const oneConcepts = asList(context);
        const twoConcepts = asList(context.same);
        for (let oneConcept of oneConcepts.value) {
          for (let twoConcept of twoConcepts.value) {
            oneConcept = api.makeObject({config, context})
            twoConcept = api.makeObject({config, context: context.same})
            api.rememberIsA(oneConcept, twoConcept)
          }
        }
        context.sameWasProcessed = true
      },
    },
    {
      notes: 'an x is a y',
      where: where(),
      match: ({context, listable}) => listable(context.marker, 'hierarchyAble') && !context.pullFromContext && context.wantsValue && context.same,
      apply: ({context, km, objects, baseConfig : config, asList}) => {
        const api = km('properties').api
        const oneConcepts = asList(context);
        const twoConcepts = asList(context.same);
        for (let oneConcept of oneConcepts.value) {
          for (let twoConcept of twoConcepts.value) {
            oneConcept = api.makeObject({config, context})
            twoConcept = api.makeObject({config, context: context.same})
            api.rememberIsA(oneConcept, twoConcept) 
            context.sameWasProcessed = true
          }
        }
      }
    },
    {
      notes: 'humans are mammels',
      where: where(),
      match: ({context, listable, hierarchy, isA, callId}) => {
        if (!context.same) {
          return
        }

        if (context.same.determiner && context.same.determiner.marker == 'a') {
          context.same.concept = true;
        } else if (context.same.evaluate) {
          return // some kind of instance
        } else if (context.same.word && pluralize.isPlural(context.same.word)) {
          context.same.concept = true;
        } else if (context.number == 'many') {
          context.same.concept = true;
        //} else if (!context.same.determiner && pluralize.isSingular(context.same.word) && !context.same.instance) {
        //  context.same.concept = true;
        } else if (isA(context.same.marker, 'hierarchyAble') && context.same.word && pluralize.isSingular(context.same.word) && !context.same.instance) {
          context.same.concept = true;
        } else {
          /*
          if (isA(context.same.marker, 'hierarchyAble') && context.same.word && pluralize.isSingular(context.same.word) && !context.same.instance) {
            console.log("the one", JSON.stringify(context.same, null, 2))
          }
          */
          /*
          if (!context.same.determiner && pluralize.isSingular(context.same.word) && !context.same.instance) {
            console.log("the one", JSON.stringify(context.same, null, 2))
          }
          */
          return
        }

        if ((hierarchy.isA(context.marker, 'property') && context.same && context.objects)|| ((context.same||{}).marker === 'readonly')) {
          return;
        }

        if (context.same && context.same.word && pluralize.isPlural(context.same.word)) {
          context.same.concept = true;
        }
       
        // getting 20 and allowing it to be a class name  like "priority is a 20"
        if (false && context.same && context.same.word && pluralize.isSingular(context.same.word)) {
          context.same.concept = true;
        }
       
        return listable(context, 'hierarchyAble') && context.same && context.same.concept && !context.query
      },
      apply: ({callId, config, objects, km, context, asList, listable}) => {
        const api = km('properties').api
        const oneConcepts = asList(context);
        const twoConcepts = asList(context.same);
        for (let oneConcept of oneConcepts.value) {
          for (let twoConcept of twoConcepts.value) {
            oneConceptId = api.makeObject({config, context: oneConcept})
            twoConceptId = api.makeObject({config, context: twoConcept})
            api.rememberIsA(oneConceptId, twoConceptId)
            context.sameWasProcessed = true
          }
        }
      }
    },
    // 'types of type'
    {
      // type of pikachu
      // types of job
      notes: 'types of type', // what are the types of animals
      where: where(),
      match: ({context}) => context.marker == 'type' && context.evaluate && context.object,
      apply: ({context, objects, km, isA}) => {
        const api = km('properties').api
        const conceptApi = km('concept').api
        const type = pluralize.singular(context.object.value);
        const children = api.children(type)
        const values = children.map( (t) => conceptApi.getWordForValue(t, { number: isA(type, 'concept') ? 'one' : 'many'}))
        context.evalue = {
          marker: 'list',
          value: values,
        }
        if (children.length > 1) {
          context.number = 'many'
        }
      }
    },
  ]
};

const initializer = ({apis, hierarchy}) => {
    apis('stm').addIsA( (child, parent) => {
      return hierarchy.isA(child, parent) 
    })
  }

knowledgeModule( { 
  config,
  includes: [properties],
  initializer,

  module,
  description: 'hierarchy of objects',
  test: {
    name: './hierarchy.test.json',
    contents: hierarchy_tests,
    // TODO doesnt this need the KM
    checks: {
      objects: ['children', 'concept', 'parents', 'properties'],
      checks: {
        context: defaultContextCheck(),
      },

    },
    includes: {
      words: true,
    }
  },
})

/* Random design notes
is greg a cat       fx fx    fxx
greg is a cat?
greg is a cat       fx xfi   xfy

is greg a cat joe a human and fred a dog


yfxx

cats and dogs are animals

1f00 == fxx -> xf
*/
