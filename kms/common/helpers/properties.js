const { id_s, id_p } = require('../runtime').theprogrammablemind
const pluralize = require('pluralize')
const { unflatten, flattens, Digraph } = require('../runtime').theprogrammablemind
const _ = require('lodash')
const deepEqual = require('deep-equal')
const { chooseNumber } = require('../helpers.js')
const { compose, translationMapping, translationMappingToInstantiatorMappings } = require('./meta.js')

class Frankenhash {
  constructor(data) {
    this.data = data
    this.data.root = {}
    this.data.handlers = {}
    this.data.initHandlers = []
  }

  setInitHandler({path, handler}) {
    this.data.initHandlers.push( { path, handler } )
  }

  setHandler(path, handler) {
    let where = this.data.handlers
    for (let arg of path.slice(0, path.length-1)) {
      if (!where[arg]) {
        where[arg] = {}
      }
      where = where[arg]
    }
    where[path[path.length-1]] = handler
  }

  getValue(path, writeDefault=true) {
    let value = this.data.root
    for (let property of path) {
      if (!value[property]) {
        if (writeDefault) {
          value[property] = {}
        } else {
          return null
        }
      }
      value = value[property]
    }
    return value
  }

  isHandler(value) {
    return value && !!value.getValue && !!value.setValue
  }

  getHandler(path) {
    let value = this.data.handlers
    for (let property of path) {
      if (this.isHandler(value)) {
        return value
      }
      value = value || {}
      value = value[property]
    }
    return value
  }

  knownProperty(path) {
    let value = this.data.root;
    for (let property of path) {
      if (!value[property]) {
        return false
      }
      value = value[property]
    }
    return !!value
  }


  ensureValue(path, value, has=true) {
    if (!this.getValue(path)) {
      this.setValue(path, value, has)
    }
  }

  setValue(path, value, has) {
    const prefix = path.slice(0, path.length - 1)
    const last = path[path.length-1]
    this.getValue(prefix)[last] = {has, value} || undefined
  }
}

class API {
  constructor() {
    this.digraph = new Digraph()
  }

  initialize() {
    this.digraph = new Digraph()

    const toJSON = (h) => {
      if (h.child && h.parent) {
        return h
      } else {
        return { child: h[0], parent: h[1] }
      }
    }
    for (const tuple of [...this.config().config.hierarchy]) {
      const h = toJSON(tuple);
      // TODO should this notice development flag?
      if (this.isOperator(h.child) && this.isOperator(h.parent)) {
        this.rememberIsA(h.child, h.parent)
      }
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
    config.addHierarchy(id_s(operator), id_s('canBeQuestion', 1))
  }

  /*
  translationMappingToInstantiatorMappings(translationMapping, from , to) {
    return translationMapping.map( (tm) => {
      return {
        // match: ({context}) => context.value == to[tm.to].value,
        match: ({context}) => context[tm.to],
        apply: ({context}) => {
          // Object.assign(context[tm.to], from[tm.from])
          // debugger;
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
               constraints: [ 
                    { 
                       property: '${after[0].tag}', 
                       properties: ['${after[0].tag}', '${before[0].tag}'], 
                       paraphrase: { marker: '${operator}', level: 1, ${before[0].tag}: { marker: '${before[0].id}', level: 1, types: [['${before[0].id}', 1]], word: '${before[0].id}' }, ${after[0].tag}: { marker: '${after[0].id}', level: 1, types: [['${after[0].id}', 1]], word: '${after[0].id}' } }, 
                       constraint: 
                          { 
                            ...next(operator), 
                            constrained: true, 
                            ${before[0].tag}: default(after[0].object, after[0]), 
                            ${after[0].tag}: { greg: true, ...before[0] }
                          } 
                    }
               ] }`,
             // bridge: `{ ...before, constraints: [ { property: '${after[0].tag}', constraint: { ...next(operator), constrained: true, ${before[0].tag}: after[0].object, ${after[0].tag}: before[0] } } ] }`,
             deferred: `{ ...next(operator), 'isEd': true, subject: 'ownee', '${after[0].tag}': { operator: operator, number: operator.number, ...before[0] }, ${before[0].tag}: after[0].object }` })
    // config.addBridge({ id: "by", level: 0, bridge: "{ ...next(operator), object: after[0] }", allowDups: true})
    /*
    config.addBridge({
         id: "by",
         level: 0,
         bridge: "{ ...next(operator), object: after[0] }",
         allowDups: true,
         optional: {
           [before[0].tag]: "{ marker: 'unknown', implicit: true, concept: true }",
         },
       })
    */
    // TODO have a prepositions category and underPrep category
    /*
    config.addPriorities([['is', 0], ['by', 0]])
    config.addPriorities([['by', 0], ['articlePOS', 0]])
    config.addPriorities([[edAble.operator, 0], ['articlePOS', 0]])
    config.addPriorities([['is', 0], [edAble.operator, 0]])
    config.addPriorities([['is', 1], [edAble.operator, 0]])
    */
    // config.addPriorities([['what', 0], ['by', 0]])
    config.addHierarchy(id_s(edAble.operator, 0), id_s('isEdAble', 1))
    config.addHierarchy(id_s(before[0].id), id_s('isEder', 1))
    config.addHierarchy(id_s(after[0].id), id_s('isEdee', 1))
    config.addSemantic({
      notes: `semantic for setting value with constraint for ${after[0].tag}`,
      match: ({context, isA}) => isA(context.marker, after[0].tag) && context.evaluate && context.constraints,
      // match: ({context, isA}) => context.marker == after[0].tag && context.evaluate,
      apply: ({km, context, e, log, isA, s}) => {
        const constraint = context.constraints[0];
        const value = constraint.constraint;
        let property = constraint.property;
        const properties = constraint.properties;
        for (let p of properties) {
          if (value[p].concept) {
            property = p
            constraint.property = p; // set what is used
          }
        }
        // value.marker = 'owns'
        // value.greg = true
        // value.ownee.query = true
        value.query = true
        let instance = e(value)
        if (instance.verbatim) {
          context.evalue = { verbatim: instance.verbatim }
          return
        }
        if (instance.evalue.marker == 'answerNotKnown#1') {
          context.evalue = instance.evalue
          return
        }
        const selected = instance.evalue.value.map( (r) => r[property] )
        context.constraints = undefined;
        context.evalue = { marker: 'list#1', value: selected }
      },
    })
    config.addGenerator({
      notes: `generator for constraint for ${edAble.operator}`,
      match: ({context}) => context.marker == id_s(edAble.operator, 1) && context.paraphrase && context.constrained,
      apply: ({context, g}) => {
        if (context[before[0].tag].marker == 'by#0') {
          // the cat wendy owned
          return `${g({...context[after[0].tag], paraphrase: true})} ${edAble.word} ${g({...context[before[0].tag], paraphrase: true})}`
        } else {
          // the cat owned by wendy
          return `${g({...context[after[0].tag], paraphrase: true})} ${edAble.word} ${['by', g({...context[before[0].tag], paraphrase: true})].filter((t) => t).join(' ')}`
        }
      },
    })
    config.addGenerator({
      match: ({context}) => {
        if (context.marker == id_s(operator, 1) && context.paraphrase) {
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
      apply: ({context, g}) => {
        const chosen = chooseNumber(context, word.singular, word.plural)
        return `${g(context[before[0].tag])} ${chosen} ${g(context[after[0].tag])}`
      }
    })
    config.addGenerator({
      match: ({context}) => context.marker == id_s(edAble.operator, 1) && context.isEd,
      apply: ({context, g}) => {
        const chosen = chooseNumber(context[after[0].tag], 'is', 'are')
        if (context[before[0].tag].evalue && context[before[0].tag].evalue.marker == 'answerNotKnown#1') {
          return g(context[before[0].tag])
        }
        return `${g(context[after[0].tag])} ${chosen} ${edAble.word} by ${g(context[before[0].tag])}`
      }
    })
    /*
    config.addAssociations([
      [['isEd', 0], ['unknown', 0], ['isEdAble', 0], ['by', 0]],
      [['isEd', 0], ['unknown', 1], ['isEdAble', 0], ['by', 0]],
      [['isEd', 0], ['what', 0], ['isEdAble', 0], ['by', 0]],
    ])
    */
    //config.addAssociations({ 
      //negative: [[['is', 0], [edAble.operator, 0]]],
      // positive: [[['isEd', 0], [edAble.operator, 0]]],
    //})
    // config.addBridge({ id: "ownee", level: 0, bridge: "{ ...next(operator) }"})
    // config.addBridge({ id: "owner", level: 0, bridge: "{ ...next(operator) }"})

    {
      const whoIsWhatVerbedBy = `${before[0].tag}Var is ${after[0].tag}Var ${edAble.word} by`
      const thisIsVerbedByThat = `${after[0].tag}Var is ${edAble.word} by ${before[0].tag}Var`

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
      
      const generator = {
        notes: `generator for who/what is X owned by for ${edAble.operator}`,
        // match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.one && context.one.marker == 'ownee' && context.one.constraints && context.one.constraints[0] && context.one.constraints[0].constraint.marker == 'owned' && context.one.constraints[0].constraint.owner.implicit,
        match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is#1') && context.one && context.one.marker == id_s(after[0].tag, 1) && context.one.constraints && context.one.constraints[0] && context.one.constraints[0].constraint.marker == id_s(edAble.operator, 1) && context.one.constraints[0].constraint[before[0].tag].implicit,
        apply: ({context, g, callId}) => {
          const isToFromM = [{"from":["one"],"to":["two"]},{"from":["two"],"to":["one"]}]
          const fromF = config.fragment(whoIsWhatVerbedBy).contexts()[0]
          // const fromF = config.fragment[before[0].tag]"ownerVar is owneeVar owned by").contexts()[0]
          // const toF = config.fragment("owneeVar is owned by ownerVar")
          const toF = config.fragment(thisIsVerbedByThat)
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
          const translation = toF.instantiate(im)
          return g(translation)
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
    const { operator, before=[], after=[], create=[], config, localHierarchy=[], relation, ordering, doAble, words = [], unflatten:unflattenArgs = [], focusable = [], edAble } = args;
    // const before = [...]
    // const after = [{tag: 'weapon', id: 'weapon'}]
    // const create = ['arm', 'weapon']

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
      config.addBridge({ id: operator, level: 1, bridge: '{ ...next(operator) }', allowDups: true })
      config.addPriorities([id_s(operator, 1), id_s('does', 0)])
      config.addPriorities([id_s(operator, 1), id_s('doesnt', 0)])
      config.addPriorities([id_s('does', 0), id_s(operator, 0)])
      config.addPriorities([id_s('doesnt', 0), id_s(operator, 0)])
    } else {
      config.addOperator({ pattern: `(${beforeOperators} [${operator}|] ${afterOperators})`, allowDups: true })
    }
 
    for (let argument of before.concat(after)) {
      if (create.includes(argument.id)) {
        // config.addHierarchy('unknown', argument.id)
        // config.addHierarchy('what', argument.id)
        // greg23 <<<<<<<<<<<< doing this
        config.addHierarchy(id_s(argument.id), id_s('unknown', 0))
        config.addHierarchy(id_s(argument.id), id_s('unknown', 1))
        config.addHierarchy(id_s(argument.id), id_s('what', 0))
        config.addHierarchy(id_s(argument.id), id_s('what', 1))
      }
    }

    create.map( (id) => {
      if (id === operator) {
        const tagsToProps = (where, args, suffix='') => {
          let i = 0;
          let r = ''
          for (let arg of args) {
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

        const unflattenArgs = [ ...before.map( (arg) => arg.tag ), ...after.map( (arg) => arg.tag ) ] 
        const focusable = [ ...before.map( (arg) => arg.tag ), ...after.map( (arg) => arg.tag ) ] 
        config.addBridge({ id: operator, level: 0, localHierarchy, bridge: `{ ... next(operator) ${doParams} ${beforeArgs} ${afterArgs}, unflatten: ${JSON.stringify(unflattenArgs)}, focusable: ${JSON.stringify(focusable)}, dead: true }`, allowDups: true })
        if (words.length > 0) {
          for (const word of words) {
            config.addWord(word, { id: operator, initial: `{ value: "${operator}" }` })
          }
        } else {
          // config.addWord(operator, { id: operator, initial: `{ value: "${operator}" }` })
        }
      } else {
        config.addBridge({ id: id, level: 0, bridge: "{ ...next(operator) }", allowDups: true })
      }
    })

    if (words.length == 0) {
      const operatorPlural = pluralize.singular(operator)
      const operatorSingular = pluralize.plural(operator)
      config.addWord(operatorSingular, { id: operator, initial: `{ value: '${operator}', number: 'one' }`})
      config.addWord(operatorPlural, { id: operator, initial: `{ value: '${operator}', number: 'many' }`})
    }

    if (doAble) {
      config.addHierarchy(id_s(operator, 0), id_s('canBeDoQuestion', 1))
      config.addHierarchy(id_s(operator, 1), id_s('canBeDoQuestion', 1))
    }

    config.addPriorities([id_s('means', 0), id_s(operator, 0)])
    config.addPriorities([id_s(operator, 0), id_s('articlePOS', 0)])

    config.addGenerator({
      notes: `ordering generator for paraphrase for ${operator}`,
      match: ({context}) => context.marker == id_s(operator, 1) && context.paraphrase && !context.query,
      apply: ({context, gp, g}) => {
        const beforeGenerator = before.map( (arg) => g(context[arg.tag]) )
        const afterGenerator = after.map( (arg) => g(context[arg.tag], { assumed: { paraphrase: true } }) )
        const word = context.word
        // return beforeGenerator.concat([`${context.word}`]).concat(afterGenerator).join(' ')
        const sub = []
        if (context.subphrase) {
          sub.push(['that'])
        }
        return beforeGenerator.concat(sub).concat([word]).concat(afterGenerator).join(' ')
      }
    })

    config.addGenerator({
      notes: `ordering generator for response for ${operator}`,
      match: ({context}) => context.marker == id_s(operator, 1) && context.evalue && context.isResponse,
      apply: ({context, g, km}) => {
        const brief = km("dialogues").api.getBrief()

        const { evalue } = context 
        let yesno = ''
        if (!context.do.query || evalue.truthValueOnly || brief) {
          if (evalue.truthValue) {
            yesno = 'yes'
          } else if (evalue.truthValue === false) {
            yesno = 'no'
          }
        }
        if (evalue.truthValueOnly || brief) {
          return `${yesno}`
        } else {
          return `${yesno} ${g(Object.assign({}, evalue, { paraphrase: true }))}`
        }
      }
    })
 
    if (ordering) {
      config.addSemantic({
        notes: `ordering setter for ${operator}`,
        // TODO use hierarchy for operator
        match: ({context}) => context.marker == id_s(operator, 1),
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
        notes: `ordering query for ${operator}`,
        match: ({context}) => context.marker == id_s(operator, 1) && context.query,
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
              context.evalue = { marker: 'list#1', value: [response] }
            } else {
              context.evalue = { marker: 'list#1', value: unflatten(matches) }
              context.evalue.isResponse = true
            }
            context.evalue.truthValue = matches.length > 0
            context.evalue.truth = { marker: 'yesno#1', value: matches.length > 0, isResponse: true, focus: true }
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
              context.evalue = { marker: 'idontknow#1', query: _.clone(context), isResponse: true }
            } else {
              context.evalue = { marker: 'list#1', value: matches, isResponse: true }
            }
            context.isResponse = true
            context.evalue.truthValue = matches.length > 0 && matches[0].marker == id_s(ordering.marker, 1)
          }
        }
      })
    }

    if (ordering || relation || doAble) {
      config.addHierarchy(id_s(operator, 0), id_s('canBeQuestion', 1))
      config.addHierarchy(id_s(operator, 1), id_s('canBeQuestion', 1))
      config.addHierarchy(id_s(operator, 0), id_s('ifAble', 1))
      config.addHierarchy(id_s(operator, 0), id_s('orAble', 1))
    }

    if (relation) {
      config.addSemantic({
        notes: `setter for ${operator}`,
        match: ({context}) => context.marker == id_s(operator, 1),
        apply: ({context, km, hierarchy, config}) => {
          const api = km('properties').api
          // add types for arguments
          for (let argument of context.focusable || []) {
            const value = api.toValue(context[argument])
            if (value) {
              /*
              if (value == 'cleo') {
                debugger;
                hierarchy.isA()
              }
              */
              const minimas = hierarchy.minima(context[argument].types)
              for (let type of minimas) {
                if (config.exists(value)) {
                  // config.addHierarchy(id_s(value), id_s(type));
                  config.addHierarchy(id_s(value), type);
                }
              }
            }
          }
          api.relation_add(context)
        }
      })
      config.addSemantic({
        notes: `getter for ${operator}`,
        match: ({context}) => context.marker == id_s(operator, 1) && context.query,
        apply: ({context, km}) => {
          const api = km('properties').api

          context.evalue = {
            marker: 'list#1',
            value: unflatten(api.relation_get(context, before.concat(after).map( (arg) => arg.tag ) ))
          }
          context.evalue.isResponse = true
          context.isResponse = true
          if (context.evalue.value.length == 0) {
            context.evalue.marker = 'answerNotKnown#1';
            context.evalue.value = [];
            context.evalue.marker = 'answerNotKnown#1';
            context.evalue.value = [];
          }
        }
      })
    }

    if (semanticApply) {
      config.addSemantic({
        notes: `override semantic apply for ${operator}`,
        match: ({context}) => context.marker == id_s(operator, 1),
        apply: semanticApply,
      })
    }
    if (doAble && edAble) {
      this.setupEdAble(args)
    }
  }

  setupObjectHierarchy(config, id, { include_concept=true  } = {}) {
    const types = [
      'theAble',
      'queryable',
      'hierarchyAble',
      'object',
      'isEdee',
      'isEder',
      'property'
    ];

    if (include_concept) {
      types.push('concept');
    }
  
    for (let type of types) {
      config.addHierarchy(id_s(id), id_s(type))
    }
  }

  makeObject(args) {
		const types = [ id_s('hierarchyAble'), id_s('object'), id_s('property') ];
    const { config } = args;
    return this.config().km("dialogues").api.makeObject({ ...args, types });
  }

  // for example, "crew member" or "photon torpedo"
  // TODO account for modifier a complex phrase for example "hot (chicken strips)"
  kindOfConcept({ config, modifier, object }) {
    const objectId = pluralize.singular(object)
    const modifierId = pluralize.singular(modifier)
    const modifierObjectId = `${modifierId}_${objectId}`

    const objectSingular = pluralize.singular(object)
    const objectPlural = pluralize.plural(object)
    config.addOperator({ pattern: `(<${modifierId}|> ([${objectId}|]))`, allowDups: true })
    config.addOperator({ pattern: `([${modifierObjectId}|])`, allowDups: true })

    config.addWord(objectSingular, { id: objectId, initial: `{ value: '${objectId}', number: 'one' }`})
    config.addWord(objectPlural, { id: objectId, initial: `{ value: '${objectId}', number: 'many' }`})
    config.addWord(modifierId, { id: modifierId, initial: `{ value: '${modifierId}' }`})

    config.addBridge({ id: modifierId, level: 0, bridge: `{ ...after, ${modifierId}: operator, marker: operator(concat('${modifierId}_', after.value)), level: 1, atomic: true, value: concat('${modifierId}_', after.value), modifiers: append(['${modifierId}'], after[0].modifiers)}`, allowDups: true })
    config.addBridge({ id: objectId, level: 0, bridge: `{ ...next(operator), value: '${objectId}' }`,  allowDups: true })
    config.addBridge({ id: modifierObjectId, level: 0, bridge: `{ ...next(operator), value: '${modifierObjectId}' }`, allowDups: true })
    {
      const word = {
        [modifierId]: {
          "marker": modifierId,
          "value": modifierId,
          "word": modifierId, 
        },
        "marker": modifierObjectId,
        "modifiers": [
          modifierId
        ],
        "types": [
          modifierObjectId,
        ],
        "value": modifierObjectId,
        "word": objectId,
      }
      this.addWord(word)
    }
    this.setupObjectHierarchy(config, objectId);
    this.setupObjectHierarchy(config, modifierId, { include_concept: false });
    this.setupObjectHierarchy(config, modifierObjectId);
    if (config.config.bridges.find( (bridge) => bridge.id === 'hierarchyAble' )) {
      config.addHierarchy(id_s(objectId), id_s('hierarchyAble', 1))
      config.addHierarchy(id_s(modifierObjectId), id_s('hierarchyAble', 1))
    }

    config.addPriorities([id_s('articlePOS', 0), id_s(modifierId, 0)])
    config.addPriorities([id_s('articlePOS', 0), id_s(objectId, 0)])
  }

  relation_add (relations) {
    if (!Array.isArray(relations)) {
      relations = [relations]
    }
    for (let relation of relations) {
      this.objects.relations.push(relation)
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

    for (let arg of args) {
      if (!matches(template[arg], value[arg])) {
        return null
      }
    }
    return value
  }

  relation_get(context, args) {
    const andTheAnswerIs = []
    for (let relation of this.objects.relations) {
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
        getValue: ([object, property]) => {
          return this.getPropertyDirectly(object, property)
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
      getValue: ([object, property]) => {
        return this.getPropertyDirectly(object, property)
      },
    })
    this.propertiesFH.setHandler(path, handler)
  }

  getObject(object) {
    return this.propertiesFH.getValue([object])
  }

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
    return this.config().km("stm").api.getVariable(context.value);
    // return context.value
  }

  getProperty(object, property, g) {
    object = this.toValue(object)
    property = this.toValue(property)
    const handler = this.propertiesFH.getHandler([object, property])
    if (handler) {
      return handler.getValue([object, property])
    }
    return this.getPropertyDirectly(object, property, g)
  }

  getPropertyDirectly(object, property, g) {
    if (property == 'properties') {
      const objectProps = this.propertiesFH.getValue([object])
      const values = []
      for (let key of Object.keys(objectProps)) {
        if (objectProps[key].has) {
          // values.push(`${g(key)}: ${g({ ...objectProps[key].value, evaluate: true })}`)
          values.push(`${g(key)}: ${g({ ...objectProps[key].value, paraphrase: true })}`)
        }
      }
      return { marker: 'list#1', value: values }
    } else {
      return this.propertiesFH.getValue([object, property]).value
    }
  }

  hasProperty(object, property, has) {
    return this.propertiesFH.getValue([object, property]).has
  }

  setProperty(object, property, value, has, skipHandler) {
    // this.addWord(value)
    if (!skipHandler) {
      const handler = this.propertiesFH.getHandler([object, property])
      if (handler) {
        return handler.setValue([object, property], value, has)
      }
    }

    this.propertiesFH.setValue([object, property], value, has)
    if (has && value) {
      let values = this.objects.property[property] || []
      if (!values.includes(value)) {
        values = values.concat(value)
      }
      this.objects.property[property] = values
      // this.objects.property[property] = (this.objects.property[property] || []).concat(value)
      // "mccoy's rank is doctor",
      // infer doctor is a type of rank
      this.rememberIsA(value.value, property);
    }
    if (!this.objects.concepts.includes(object)) {
      this.objects.concepts.push(pluralize.singular(object))
    }
  }

  knownObject(object) {
    if (object == 'properties') {
      return object
    }
    if ((object || {}).value) {
      object = value
    }
    const path = [object]
    // return this.knownPropertyNew(path)
    return this.propertiesFH.knownProperty(path)
  }

  hasProperty(object, property) {
    if (property == 'properties') {
      return true;
    }

    // go up the hierarchy
    const todo = [object];
    const seen = [object];
    while (todo.length > 0) {
      const next = todo.pop();
      if ((this.propertiesFH.getValue([next, property], false) || {}).has) {
        return true
      }
      const parents = this.objects.parents[next] || [];
      for (let parent of parents) {
        if (!seen.includes(parent)) {
          todo.push(parent)
          seen.push(parent)
        } 
      }
    }
    return false
  }

  // NOT DONE
  knownProperty(object, property) {
    object = this.toValue(object)
    property = this.toValue(property)
    if (property == 'properties') {
      return true;
    }

    // go up the hierarchy
    const todo = [object];
    const seen = [object];
    while (todo.length > 0) {
      const next = todo.pop();
      if ((this.propertiesFH.getValue([next, property], false) || {}).has) {
        return true
      }
      const parents = this.objects.parents[next] || [];
      for (let parent of parents) {
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
/*
  ensureDefault(map, key, default) {
    if (!this.objects[map][key]) {
      this.objects[map][key] = default
    }
    return this.objects[map][key]
  }

  pushListNoDups(list, value) {
    if (list.includes(value)) {
      return
    }
    list.push(value)
  }

  ensureConcept(concept) {
    ensureDefault(this.properties, concept, {})
    ensureDefault(this.concepts, concept, [])
  }

  canDo(object, ability) {
    this.ensureConcept(object)
    this.pushListNoDups(this.ensureList('abilities', object), ability)
  }
*/
  isA(child, ancestor) {
    // return this.objects.parents[child].includes(parent);
    const todo = [child];
    const seen = [child];
    while (todo.length > 0) {
      const next = todo.pop();
      if (next == ancestor) {
        return true
      }
      const parents = this.objects.parents[next] || [];
      for (let parent of parents) {
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

    if (!this.objects.parents[child]) {
      this.objects.parents[child] = []
    }
    if (!this.objects.parents[child].includes(parent)) {
      this.objects.parents[child].push(parent)
    }

    if (!this.objects.children[parent]) {
      this.objects.children[parent] = []
    }
    if (!this.objects.children[parent].includes(child)) {
      this.objects.children[parent].push(child)
    }

    if (!this.objects.concepts.includes(child)) {
      this.objects.concepts.push(child)
    }

    if (!this.objects.concepts.includes(parent)) {
      this.objects.concepts.push(parent)
    }

    if (this.isOperator(child) && this.isOperator(parent)) {
      this.config().addHierarchy(child, parent)
    }

    this.propertiesFH.ensureValue([child], {})
    this.propertiesFH.ensureValue([parent], {})
  }

  isOperator(opKey) {
    try {
      const { id } = id_p(opKey)
      for (let bridge of this.config().config.bridges) {
        if (bridge.id == id) {
          return true
        }
      }
    } catch( e ) {
      // invalid opKey so not an operator
    }
    return false
  }

  children(parent) {
    return this.objects.children[parent] || []
  }

  conceptExists(concept) {
    return this.objects.concepts.includes(concept)
  }

  addWord(context) {
    if (!context || !context.value || !context.word) {
      return
    }
    this.addWordToValue(context.value, context)
  }

  addWordToValue(value, word) {
    if (!this.objects.valueToWords[value]) {
      this.objects.valueToWords[value] = []
    }

    word = Object.assign({}, word)
    delete word.evalue
    word.paraphrase = true

    if (this.objects.valueToWords[value].some( (entry) => deepEqual(entry, word) )) {
      return
    }

    const words = this.objects.valueToWords[value]
    if (!words.includes(word)) {
      words.push(word)
    }
  }

  getWordForValue(value, { number } = {}) {
    let context;
    if (!this.objects.valueToWords[value]) {
      context = { marker: value, value: value, number, word: id_p(value).id, paraphrase: true }
    } else {
      context = this.objects.valueToWords[value][0]
    }
    if (context.word) {
      context.word = (number == 'many') ? pluralize.plural(context.word) : pluralize.singular(context.word)
    }
    return context
  }

  getWordsForValue(value) {
    return this.objects.valueToWords[value]
  }

  set objects(objects) {
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
  }

  get objects() {
    return this._objects
  }

  set config(config) {
    this._config = config
    /*
    const toJSON = (h) => {
      if (h.child && h.parent) {
        return h
      } else {
        return { child: h[0], parent: h[1] }
      }
    }
    for (const tuple of [...config().config.hierarchy]) {
      const h = toJSON(tuple);
      // TODO should this notice development flag?
      if (this.isOperator(h.child) && this.isOperator(h.parent)) {
        this.rememberIsA(h.child, h.parent)
      }
    }
    */
  }

  get config() {
    return this._config
  }
}

module.exports = {
  API,
  Frankenhash,
}
