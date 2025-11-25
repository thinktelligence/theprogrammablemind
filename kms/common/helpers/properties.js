const pluralize = require('pluralize')
const { unflatten, flattens, Digraph } = require('../runtime').theprogrammablemind
const _ = require('lodash')
const deepEqual = require('deep-equal')
const { chooseNumber, removeProp } = require('../helpers.js')
const { Frankenhash } = require('./frankenhash.js')
const { compose, translationMapping, translationMappingToInstantiatorMappings } = require('./meta.js')

class API {
  constructor() {
    this.digraph = new Digraph()
  }

  initialize({ km, objects, config }) {
    this._objects = objects

    objects.concepts = ['properties']
    // object -> property -> {has, value}
    objects.properties = {}
    // property -> values
    objects.property = {}
    objects.parents = {}
    objects.children = {}
    objects.relations = []
    objects.valueToWords = {}
    this.propertiesFH = new Frankenhash(objects.properties)

    this._km = km
    this.__config = config
    this.digraph = new Digraph()
    function toJSON(h) {
      if (h.child && h.parent) {
        return h
      } else {
        return { child: h[0], parent: h[1] }
      }
    }
    // for (const tuple of [...this.config().config.hierarchy]) {
    for (const tuple of [...config.getHierarchy()]) {
      const h = toJSON(tuple);
      // TODO should this notice development flag?
      if (this.isOperator(h.child) && this.isOperator(h.parent)) {
        this.rememberIsA(h.child, h.parent)
      }
    }

    if (km('concept')) {
      km('concept').api.addDefaultTypesForObjectHierarchy([
        'theAble',
        'queryable',
        'hierarchyAble',
        'object',
        'isEdee',
        'isEder',
        'property'
      ])
    }
  }

  createBinaryRelation (config, operator, words, before, after) {
    this.createActionPrefix({
                operator: operator,
                words: words,
                create: [operator],
                before: [{tag: before, id: 'object'}],
                after: [{tag: after, id: 'object'}],
                // relation: true,
                relation: false,
                doAble: true,
                config,
                unflatten: [before, after],
              })
    config.addHierarchy(operator, 'canBeQuestion')
  }

  /*
  translationMappingToInstantiatorMappings(translationMapping, from , to) {
    return translationMapping.map( (tm) => {
      return {
        // match: ({context}) => context.value == to[tm.to].value,
        match: ({context}) => context[tm.to],
        apply: ({context}) => {
          // Object.assign(context[tm.to], from[tm.from])
          context[tm.to] = from[tm.from]
          if (context[tm.to]) {
            context[tm.to].instantiated = true
          }
        }
      }
    })
  }
  */

  setupEdAble(args) {
    const { operator, word, before=[], after=[], create=[], config, relation, ordering, doAble, words = [], unflatten:unflattenArgs = [], focusable = [], edAble, localHierarchy } = args;
    config.addOperator(`(([${after[0].tag}])^ <${edAble.operator}|${edAble.word}> ([by] ([${before[0].tag}])?))`)
    config.addBridge({
             id: edAble.operator,
             level: 0,
             localHierarchy,
             bridge: `{ 
               ...before, 
               marker: operator('${after[0].tag}'),
               constraints: [ 
                    { 
                       property: '${after[0].tag}', 
                       properties: ['${after[0].tag}', '${before[0].tag}'], 
                       paraphrase: { marker: '${operator}', ${before[0].tag}: { marker: '${before[0].id}', types: ['${before[0].id}'], word: '${before[0].id}' }, ${after[0].tag}: { marker: '${after[0].id}', types: ['${after[0].id}'], word: '${after[0].id}' } }, 
                       constraint: 
                          { 
                            ...next(operator), 
                            constrained: true, 
                            ${before[0].tag}: default(after[0].object, after[0]), 
                            ${after[0].tag}: { ...before[0] }
                          } 
                    }
               ] }`,
             deferred: `{ ...next(operator), 'isEd': true, subject: 'ownee', '${after[0].tag}': { operator: operator, number: operator.number, ...before[0] }, ${before[0].tag}: after[0].object }` })
    // TODO have a prepositions category and underPrep category
    config.addHierarchy(edAble.operator, 'isEdAble')
    config.addHierarchy(before[0].id, 'isEder')
    config.addHierarchy(after[0].id, 'isEdee')
    config.addHierarchy('isEdee', 'queryable')
    config.addSemantic({
      notes: 'semantic for setting value with constraint',
      match: ({context, isA}) => isA(context.marker, after[0].tag) && context.evaluate && context.constraints,
      // match: ({context, isA}) => context.marker == after[0].tag && context.evaluate,
      apply: async ({km, context, e, log, isA}) => {
        const constraint = context.constraints[0];
        const value = constraint.constraint;
        let property = constraint.property;
        const properties = constraint.properties;
        for (const p of properties) {
          if (value[p].concept) {
            property = p
            constraint.property = p; // set what is used
          }
        }
        // value.marker = 'owns'
        // value.greg = true
        // value.ownee.query = true
        value.query = true
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
        context.evalue = { marker: 'list', value: selected }
      },
    })
    config.addGenerator({
      notes: 'generator for constraint',
      match: ({context}) => context.marker == edAble.operator && context.paraphrase && context.constrained,
      apply: async ({context, g}) => {
        if (context[before[0].tag].marker == 'by') {
          // the cat wendy owned
          return `${await g({...context[after[0].tag], paraphrase: true})} ${edAble.word} ${await g({...context[before[0].tag], paraphrase: true})}`
        } else {
          // the cat owned by wendy
          return `${await g({...context[after[0].tag], paraphrase: true})} ${edAble.word} ${['by', await g({...context[before[0].tag], paraphrase: true})].filter((t) => t).join(' ')}`
        }
      },
    })
    config.addGenerator({
      match: ({context}) => {
        if (context.marker == operator && context.paraphrase) {
          if (context['do']) {
            const left = context['do'].left
            if (context[left]) {
              // who owns X should not be 'does who own x' but instead 'who owns x'
              if (context[left].query) {
                return true;
              }
            }
          }
        }

        return false;
      },
      apply: async ({context, g}) => {
        const chosen = chooseNumber(context, word.singular, word.plural)
        return `${await g(context[before[0].tag])} ${chosen} ${await g(context[after[0].tag])}`
      }
    })
    config.addGenerator({
      match: ({context}) => context.marker == edAble.operator && context.isEd,
      apply: async ({context, g}) => {
        const chosen = chooseNumber(context[after[0].tag], 'is', 'are')
        if (context[before[0].tag].evalue && context[before[0].tag].evalue.marker == 'answerNotKnown') {
          return await g(context[before[0].tag])
        }
        return `${await g(context[after[0].tag])} ${chosen} ${edAble.word} by ${await g(context[before[0].tag])}`
      }
    })

    {
      const whoIsWhatVerbedBy = `${before[0].tag}var is ${after[0].tag}var ${edAble.word} by`
      const thisIsVerbedByThat = `${after[0].tag}var is ${edAble.word} by ${before[0].tag}var`

      // greg32 check this out
      // config.addFragments([whoIsWhatVerbedBy])
      config.addFragments([
          whoIsWhatVerbedBy, 
          {
            /*
            hierarchy: [
              ['owneevar', 'ownee']
            ],
            */
            query: thisIsVerbedByThat
          },
      ])
      
      // config.addHierarchy({ child: 'owneeVar', parent: 'isEdee', maybe: true})
      // config.addHierarchy({ child: 'ownerVar', parent: 'isEder', maybe: true})
      // config.addFragments([`${before[0].tag}Var is ${after[0].tag}Var ${edAble.word} by`, `${after[0].tag}Var is ${edAble.word} by ${before[0].tag}Var`])
      // config.addFragments(["ownerVar is owneeVar owned by", "owneeVar is owned by ownerVar"])

      const generator = {
        notes: `generator for who/what is X owned by`,
        // match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.one && context.one.marker == 'ownee' && context.one.constraints && context.one.constraints[0] && context.one.constraints[0].constraint.marker == 'owned' && context.one.constraints[0].constraint.owner.implicit,
        match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.one && context.one.marker == after[0].tag && context.one.constraints && context.one.constraints[0] && context.one.constraints[0].constraint.marker == edAble.operator && context.one.constraints[0].constraint[before[0].tag].implicit,
        apply: async ({context, fragments, g, gs, callId}) => {
          const isToFromM = [{"from":["one"],"to":["two"]},{"from":["two"],"to":["one"]}]
          const fromF = fragments(whoIsWhatVerbedBy).contexts()[0]
          const toF = fragments(thisIsVerbedByThat)
          const to = toF.contexts()[0]
          const tm = translationMapping(fromF, to)
          /*
          some kind of compose
          const isToFromM = '[{"from":["one"],"to":["two"]},{"from":["two"],"to":["one"]}]'
          isToFromM + tm -> '[{"from":["one"],"to":["owner"]},{"from":["two"],"to":["ownee"]},{"from":["number"],"to":["number"]}]'
          output
              '[{"from":["two"],"to":["owner"]},{"from":["one"],"to":["ownee"]},{"from":["number"],"to":["number"]}]'
          */
          const tmPrime = compose(isToFromM, tm)
          // const from = context.one.constraints[0].constraint
          const from = context
          const im = translationMappingToInstantiatorMappings(tmPrime, from, to)
          const translation = await toF.instantiate(im)
          if (Array.isArray(translation)) {
            return await gs(translation)
          } else {
            return await g(translation)
          }
        }
      }
      config.addGenerator(generator)
    }
  }
  // createActionPrefix({before, operator, words, after, semantic, create})
  //
  // tag == property name + id == operator id
  // before == [ { tag, marker }, ... ]
  // create == [ id, ... ] // ids to create bridges for
  // doAble : true if the qustion like this work "does b[0] <marker> b[0]" for example does g2reg like bananas
  // relation -> the semantics will be implements using relations
  // edable: "y is owned by x" edable = { operator: 'owned' }
  createActionPrefix(args, semanticApply) {
    const { 
      operator, 
      before=[], 
      after=[], 
      create:createInit=[], 
      hierarchy=[], 
      config, 
      localHierarchy=[], 
      relation, 
      ordering, 
      doAble, 
      flatten,
      can,
      words = [], 
      unflatten:unflattenArgs = [], 
      focusable = [], 
      edAble } = args;

    function createToCanonical(concept) {
      if (typeof concept == 'string') {
        return { id: concept, isA: [] }
      } else {
        return { isA: [], ...concept }
      }
    }

    const create = createInit.map(createToCanonical)

    if (doAble) {
      if (before.length != 1) {
        throw "Expected exactly one before argument"
      }
      if (after.length != 1) {
        throw "Expected exactly one after argument"
      }
    }

    const beforeOperators = before.map( (arg) => `([${arg.id}|])` ).join('')
    const beforeOperatorsEdable = before.map( (arg) => `([${arg.id}|])^` ).join('')
    const afterOperators = after.map( (arg) => `([${arg.id}|])` ).join('')
    // config.addOperator(`(${beforeOperators} [${operator}|] ${afterOperators})`)

    if (doAble) {
      config.addOperator({ 
        pattern: `([(${beforeOperators} [${operator}|] ${afterOperators}^)])`, 
        allowDups: true,
      })
      // config.addOperator({ id: operator, level: 1, words: [operator] })
      config.addBridge({ 
        id: operator, 
        level: 1, 
        bridge: '{ ...next(operator) }', 
        allowDups: true,
      })
      config.addPriority({ "context": [['does', 0], [operator, 1], ], "choose": [0] })
      config.addPriority({ "context": [['doesnt', 0], [operator, 1], ], "choose": [0] })
      config.addPriority({ "context": [[operator, 0], ['does', 0], ], "choose": [0] })
      config.addPriority({ "context": [[operator, 0], ['doesnt', 0], ], "choose": [0] })
    } else {
      config.addOperator({ pattern: `(${beforeOperators} [${operator}|] ${afterOperators})`, allowDups: true })
    }

    if (false) {
      for (const argument of before.concat(after)) {
        if (create.includes(argument.id)) {
          // config.addHierarchy('unknown', argument.id)
          // config.addHierarchy('what', argument.id)
          // greg23 <<<<<<<<<<<< doing this
          config.addHierarchy(argument.id, 'unknown')
          config.addHierarchy(argument.id, 'what')
        }
      } 
    } else {
      for (const argument of before.concat(after)) {
        if (create.includes(argument.id)) {
          // config.addHierarchy(argument.id, 'unknown')
          // config.addHierarchy(argument.id, 'what')
          localHierarchy.push([argument.id, 'unknown'])
          localHierarchy.push([argument.id, 'what'])
        }
      }
    }

    create.map( ({ id, isA }) => {
      if (id === operator) {
        function tagsToProps(where, args, suffix='') {
          const i = 0;
          let r = ''
          for (const arg of args) {
            r += `, ${arg.tag}${suffix}: ${where}[${i}] `
          }
          return r
        }
        const beforeArgs = tagsToProps('before', before)
        let afterArgs = tagsToProps('after', after)
        let doParams = '';
        if (doAble) {
          doParams = `, do: { left: "${before[0].tag}", right: "${after[0].tag}" } `
          afterArgs = tagsToProps('after', after, '*')
        }

        // const subjectContext = before[0].tag
        // const interpolate = "[" + before.map((arg) => `{ property: '${arg.tag}' }`).concat(`{ ...operator, evaluateWord: true, number: ${subjectContext}.number }`).concat(after.map((arg) => `{ property: '${arg.tag}' }`)).join(',') + "]"
        const imperative = (before.length == 0) ? "true" : "false"
        // const interpolate = "[" + before.map((arg) => `{ property: '${arg.tag}' }`).concat(`{ ...operator, evaluateWord: true, imperative: ${imperative}, isVerb: true, number: 'one' }`).concat(after.map((arg) => `{ property: '${arg.tag}' }`)).join(',') + "]"
        // const interpolateVerb = `{ property: "operator", context: { evaluateWord: true, imperative: ${imperative}, isVerb: true, number: 'one' } }`
        const interpolateVerb = `{ property: "operator" }`
        const interpolate = "[" + before.map((arg) => `{ property: '${arg.tag}' }`).concat(interpolateVerb).concat(after.map((arg) => `{ property: '${arg.tag}' }`)).join(',') + "]"

        const unflattenArgs = [ ...before.map( (arg) => arg.tag ), ...after.map( (arg) => arg.tag ) ] 
        const focusable = [ ...before.map( (arg) => arg.tag ), ...after.map( (arg) => arg.tag ) ] 
        let flattenProperty = ''
        if (flatten) {
          flattenProperty = ", flatten: true, relation: true "
        }
        config.addBridge({ 
          id: operator, 
          level: 0, 
          localHierarchy: [...localHierarchy, ['object', 'unknown']],
          bridge: `{ ... next(operator) ${flattenProperty} ${doParams} ${beforeArgs} ${afterArgs}, operator: { ...operator, evaluateWord: true, imperative: ${imperative}, isVerb: true, number: 'one' }, unflatten: ${JSON.stringify(unflattenArgs)}, focusable: ${JSON.stringify(focusable)}, interpolate: ${interpolate} }`, 
          allowDups: true 
        })
        if (words.length > 0) {
          for (const word of words) {
            config.addWord(word, { id: operator, initial: `{ value: "${operator}" }` })
          }
        } else {
          // config.addWord(operator, { id: operator, initial: `{ value: "${operator}" }` })
        }
      } else {
        config.addBridge({ id: id, allowDups: true })
      }

      for (const parentId of isA) {
        config.addHierarchy(id, parentId)
      }
    })

    if (words.length == 0) {
      const operatorPlural = pluralize.singular(operator)
      const operatorSingular = pluralize.plural(operator)
      config.addWord(operatorSingular, { id: operator, initial: `{ value: '${operator}', number: 'one' }`})
      config.addWord(operatorPlural, { id: operator, initial: `{ value: '${operator}', number: 'many' }`})
    }

    for (const { child, parent } of hierarchy) {
      config.addHierarchy(child, parent)
    }

    if (doAble) {
      config.addHierarchy(operator, 'canBeDoQuestion')
    }

    config.addPriority({ "context": [[operator, 0], ['means', 0], ], "choose": [0] })
    config.addPriority({ "context": [['article', 0], [operator, 0], ], "choose": [0] })

    if (can) {
      const beforeIds = before.map((def) => def.id)
      const afterIds = after.map((def) => def.id)
      config.addHierarchy(operator, 'canableAction')
      config.addAssociation({ context: [[afterIds[0], 0], ['whatCanQuestion', 0], [beforeIds[0], 0], ['make', 0]], choose: 1 })
      config.addAssociation({ context: [[afterIds[0], 1], ['whatCanQuestion', 0], [beforeIds[0], 0], ['make', 0]], choose: 1 })
    }
    if (false) {
      config.addGenerator({
        notes: 'ordering generator for paraphrase',
        match: ({context}) => context.marker == operator && context.paraphrase && !context.query,
        apply: async ({context, gp, g}) => {
          const beforeGenerator = []
          for (const arg of before) {
            beforeGenerator.push(await g(context[arg.tag]))
          }
          const afterGenerator = []
          for (const arg of after) {
            afterGenerator.push(await gp(context[arg.tag]))
          }
          const word = context.word
          const sub = []
          if (context.subphrase) {
            sub.push(['that'])
          }
          return beforeGenerator.concat(sub).concat([word]).concat(afterGenerator).join(' ')
        }
      })
    }

    if (true) {
      config.addGenerator({
        notes: 'ordering generator for response',
        match: ({context}) => context.marker == operator && context.evalue && context.isResponse,
        apply: async ({context, g, km, flatten}) => {
          const brief = km("dialogues").api.getBrief()

          const { evalue } = context 
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
          // if (!context.do?.query || evalue.truthValueOnly || context.truthValueOnly || brief) {
          if (evalue.truthValueOnly || context.truthValueOnly || context.wantsTruthValue || brief || !hasVariables) {
            function any(value, test) {
              if (test(value)) {
                return true
              }
              const values = flatten(['list'], value)[0]
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
            const details = await g(Object.assign({}, evalue, { paraphrase: true }))
            if (yesno) {
              return `${yesno} ${details}`
            }
            else {
              return details
            }
          }
        }
      })
    }
 
    if (ordering) {
      config.addSemantic({
        notes: 'ordering setter',
        // TODO use hierarchy for operator
        match: ({context}) => context.marker == operator,
        apply: ({context, km}) => {
          //const api = km('ordering').api
          // api.setCategory(ordering.name, context[ordering.object].value, context[ordering.category].value, context)
          const propertiesAPI = km('properties').api
          context.ordering = ordering.name
          const fcontexts = flattens(['list'], [context])
          for (const fcontext of fcontexts) {
            fcontext.paraphrase = true
            fcontext[ordering.object].paraphrase = true
            fcontext[ordering.category].paraphrase = true
          }
          propertiesAPI.relation_add(fcontexts) 
        }
      })
      config.addSemantic({
        notes: 'ordering query',
        match: ({context}) => context.marker == operator && context.query,
        apply: ({context, km}) => {
          const api = km('ordering').api
          const propertiesAPI = km('properties').api
          context.ordering = ordering.name
          const matches = propertiesAPI.relation_get(context, ['ordering', ordering.object, ordering.category])
          if (matches.length > 0 || (typeof context.query == 'boolean' && context.query)) {
            // does greg like bananas
            if (matches.length == 0) {
              const response = _.clone(context)
              response.isResponse = true
              response.query = undefined
              context.evalue = { marker: 'list', value: [response] }
            } else {
              context.evalue = { marker: 'list', value: unflatten(matches) }
              context.evalue.isResponse = true
            }
            context.evalue.truthValue = matches.length > 0
            context.evalue.truth = { marker: 'yesno', value: matches.length > 0, isResponse: true, focus: true }
            context.evalue.focusable = ['truth']
            if (!context.evalue.truthValue) {
              context.evalue.truthValueOnly = true
            }

            // ADD this line back and remove it to check
            // context.response = { marker: 'list', value: [response], isResponse: true }
            // Object.assign(context, { marker: 'list', value: responses, focusable: ['value'], paraphrase: true, truthValue: matches.length > 0 })
          } else {
            // see if anything is preferred greg
            // what does greg like
            const matches = propertiesAPI.relation_get(context, ['ordering', ordering.object])
            if (matches.length == 0) {
              // Object.assign(context, { marker: 'idontknow', query: _.clone(context) })
              context.evalue = { marker: 'idontknow', query: _.clone(context), isResponse: true }
            } else {
              context.evalue = { marker: 'list', value: matches, isResponse: true }
            }
            context.isResponse = true
            context.evalue.truthValue = matches.length > 0 && matches[0].marker == ordering.marker
          }
        }
      })
    }

    if (ordering || relation || doAble) {
      config.addHierarchy(operator, 'canBeQuestion')
      config.addHierarchy(operator, 'ifAble')
      config.addHierarchy(operator, 'orAble')
    }

    if (relation) {
      config.addSemantic({
        notes: `setter for ${operator}`,
        match: ({context}) => context.marker == operator,
        apply: ({context, km, hierarchy, config}) => {
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
      })
      config.addSemantic({
        notes: `getter for ${operator}`,
        match: ({context}) => context.marker == operator && context.query,
        apply: ({context, km, callId}) => {
          const api = km('properties').api
          context.evalue = {
            marker: 'list',
            value: unflatten(api.relation_get(context, before.concat(after).map( (arg) => arg.tag ) ))
          }
          context.evalue.isResponse = true
          context.isResponse = true
          if (context.evalue.value.length == 0) {
            context.evalue.marker = 'answerNotKnown';
            context.evalue.value = [];
          } else {
            // context.evalue.truthValue = true
          }
        }
      })
    }

    if (semanticApply) {
      config.addSemantic({
        notes: `override semantic apply for ${operator}`,
        match: ({context}) => context.marker == operator,
        apply: semanticApply,
      })
    }
    if (doAble && edAble) {
      this.setupEdAble(args)
    }
  }

  async makeObject(args) {
		const types = [ 'hierarchyAble', 'object', 'property' ];
    return await args.km("dialogues").api.makeObject({ ...args, types: (args.types || []).concat(types) });
  }

  relation_add (relations) {
    removeProp(relations, (val, prop, obj) => prop === 'range')

    if (!Array.isArray(relations)) {
      relations = [relations]
    }
    for (const relation of relations) {
      relation.truthValue = true
      this._objects.relations.push(relation)
    }
  }

  relation_match (args, template, value) {
    const matches = (t, v) => {
      if (typeof t == 'string' || typeof v == 'string') {
        return t == v
      }

      if (!t || !v) {
        return null
      }

      if (t.query) {
        return true
      }

      if (t.concept) {
        // const api = args.km('properties').api
        if (v.unknown && !t.value) {
          return true;
        }
        return this.isA(v.value, t.value)
      }

      /* wtf
      if (!t.value && !v.value) {
        return this.isA(v.value, t.value);
      }
      */

      return t.value && v.value && t.value == v.value
    }

    for (const arg of args) {
      if (!matches(template[arg], value[arg])) {
        return null
      }
    }
    return value
  }

  relation_get (context, args) {
    const andTheAnswerIs = []
    for (const relation of this._objects.relations) {
      if (this.relation_match(args, context, relation)) {
        const queriedArgs = args.filter( (arg) => context[arg].query )
        if (queriedArgs.length == 1) {
          relation[queriedArgs[0]] = { ...relation[queriedArgs[0]], focus: true }
        }

        andTheAnswerIs.push(Object.assign({}, relation, { paraphrase: true }))
      }
    }
    return andTheAnswerIs
  }

  /*
  copyShared(fromApi) {
    for (let {path, handler} of fromApi.objects.initHandlers) {
      this.setShared(args, handler)
    }
  }
  */

  setShared(path, handler) {
    if (!handler) {
      handler = new Object({
        setValue: ([object, property], value, has) => {
          return this.setProperty(object, property, value, has, true)
        },
        getValue: async ([object, property]) => {
          return await this.getPropertyDirectly(object, property)
        },
      })
    }
    this.propertiesFH.setHandler(path, handler)
    this.propertiesFH.setInitHandler( { path, handler } )
    return handler
  }

  setReadOnly(path) {
    const handler = new Object({
      setValue: ([object, property], value, has) => {
        const error = Error(`The property '${property}' of the object '${object}' is read only`)
        error.code = 'ReadOnly'
        throw error
      },
      getValue: async ([object, property]) => {
        return await this.getPropertyDirectly(object, property)
      },
    })
    this.propertiesFH.setHandler(path, handler)
  }

  /*
  async getObject(object) {
    return this.propertiesFH.getValue([object])
  }
  */

  getHandler(object, property) {
    return this.propertiesFH.getHandler([object, property])
  }

  toValue(context) {
    if (typeof context == 'string') {
      return context
    }
    if (!context) {
      return;
    }
    return this._km("stm").api.getVariable(context.value);
    // return context.value
  }

  async getProperty(object, property, g) {
    object = this.toValue(object)
    property = this.toValue(property)
    const handler = this.propertiesFH.getHandler([object, property])
    if (handler) {
      return await handler.getValue([object, property])
    }
    return await this.getPropertyDirectly(object, property, g)
  }

  async getPropertyDirectly(object, property, g) {
    if (property == 'property') {
      const objectProps = await this.propertiesFH.getValue([object])
      const values = []
      for (const key of Object.keys(objectProps)) {
        if (objectProps[key].has) {
          values.push(`${await g(key)}: ${await g({ ...objectProps[key].value, paraphrase: true })}`)
        }
      }
      return { marker: 'list', value: values }
    } else {
      return (await this.propertiesFH.getValue([object, property])).value
    }
  }

  async hasProperty(object, property, has) {
    return (await this.propertiesFH.getValue([object, property])).has
  }

  setProperty(object, property, value, has, skipHandler) {
    if (!skipHandler) {
      const handler = this.propertiesFH.getHandler([object, property])
      if (handler) {
        return handler.setValue([object, property], value, has)
      }
    }

    this.propertiesFH.setValue([object, property], value, has)
    if (has && value) {
      let values = this._objects.property[property] || []
      if (!values.includes(value)) {
        values = values.concat(value)
      }
      this._objects.property[property] = values
      // this._objects.property[property] = (this.objects.property[property] || []).concat(value)
      // "mccoy's rank is doctor",
      // infer doctor is a type of rank
      this.rememberIsA(value.value, property);
    }
    if (!this._objects.concepts.includes(object)) {
      this._objects.concepts.push(pluralize.singular(object))
    }
  }

  async knownObject(object) {
    if (object == 'property') {
      return object
    }
    if ((object || {}).value) {
      object = value
    }
    const path = [object]
    // return this.knownPropertyNew(path)
    return await this.propertiesFH.knownProperty(path)
  }

  async hasProperty(object, property) {
    if (property == 'property') {
      return true;
    }

    // go up the hierarchy
    const todo = [object];
    const seen = [object];
    while (todo.length > 0) {
      const next = todo.pop();
      if ((await this.propertiesFH.getValue([next, property], false) || {}).has) {
        return true
      }
      const parents = this._objects.parents[next] || [];
      for (const parent of parents) {
        if (!seen.includes(parent)) {
          todo.push(parent)
          seen.push(parent)
        } 
      }
    }
    return false
  }

  // NOT DONE
  async knownProperty(object, property) {
    object = this.toValue(object)
    property = this.toValue(property)
    if (property == 'property') {
      const objectProps = await this.propertiesFH.getValue([object])
      return !_.isEmpty(objectProps)
    }

    // go up the hierarchy
    const todo = [object];
    const seen = [object];
    while (todo.length > 0) {
      const next = todo.pop();
      if ((await this.propertiesFH.getValue([next, property], false) || {}).has) {
        return true
      }
      const parents = this._objects.parents[next] || [];
      for (const parent of parents) {
        if (!seen.includes(parent)) {
          todo.push(parent)
          seen.push(parent)
        } 
      }
    }
    return false
  }

  learnWords(config, context) {
  }
  isA(child, ancestor) {
    // return this._objects.parents[child].includes(parent);
    const todo = [child];
    const seen = [child];
    while (todo.length > 0) {
      const next = todo.pop();
      if (next == ancestor) {
        return true
      }
      const parents = this._objects.parents[next] || [];
      for (const parent of parents) {
        if (!seen.includes(parent)) {
          todo.push(parent)
          seen.push(parent)
        } 
      }
    }
    return false
  }

  rememberIsA(child, parent) {
    this.digraph.add(child, parent)

    if (!this._objects.parents[child]) {
      this._objects.parents[child] = []
    }
    if (!this._objects.parents[child].includes(parent)) {
      this._objects.parents[child].push(parent)
    }

    if (!this._objects.children[parent]) {
      this._objects.children[parent] = []
    }
    if (!this._objects.children[parent].includes(child)) {
      this._objects.children[parent].push(child)
    }

    if (!this._objects.concepts.includes(child)) {
      this._objects.concepts.push(child)
    }

    if (!this._objects.concepts.includes(parent)) {
      this._objects.concepts.push(parent)
    }

    if (this.isOperator(child) && this.isOperator(parent)) {
      this.__config.addHierarchy(child, parent)
    }

    this.propertiesFH.ensureValue([child], {})
    this.propertiesFH.ensureValue([parent], {})
  }

  isOperator(id) {
    for (const bridge of this.__config.getBridges()) {
      if (bridge.id == id) {
        return true
      }
    }
    return false
  }

  children(parent) {
    return this._objects.children[parent] || []
  }

  conceptExists(concept) {
    return this._objects.concepts.includes(concept)
  }

  set objects(objects) {
    /*
    this._objects = objects

    objects.concepts = ['properties']
    // object -> property -> {has, value}
    objects.properties = {}
    // property -> values
    objects.property = {}
    objects.parents = {}
    objects.children = {}
    objects.relations = []
    objects.valueToWords = {}
    this.propertiesFH = new Frankenhash(objects.properties)
    */
    throw "delete me"
  }

  get objects() {
    return this._objects
  }

  set config(config) {
    this._config = config
  }

  get config() {
    return this._config
  }
}

module.exports = {
  API,
  Frankenhash,
}
