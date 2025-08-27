const { knowledgeModule, where, stableId } = require('./runtime').theprogrammablemind
const meta = require('./meta.js')
const gdefaults = require('./gdefaults.js')
const sdefaults = require('./sdefaults.js')
const asking = require('./asking.js')
const conjunction = require('./conjunction.js')
const articles = require('./articles.js')
const pos = require('./pos.js')
const negation = require('./negation.js')
const punctuation = require('./punctuation.js')
const stm = require('./stm.js')
const _ = require('lodash')
const { API } = require('./helpers/dialogues')
const { isMany, propertyToArray, words } = require('./helpers')
const dialogues_tests = require('./dialogues.test.json')
const { defaultContextCheck, indent, focus } = require('./helpers')
const pluralize = require('pluralize')

const api = new API()

const warningIsANotImplemented = (log, context) => {
  const description = 'WARNING from Dialogues KM: For semantics in order to handle sentences of type "x is y?", set the response to what you like.'
  const match = `({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.query && <other conditions as you like>`
  const apply = `({context}) => <do stuff...>; context.evalue = <value>`
  const input = indent(JSON.stringify(context, null, 2), 2)
  const message = `${description}\nThe semantic would be\n  match: ${match}\n  apply: ${apply}\nThe input context would be:\n${input}\n`
  log(indent(message, 4))
}

const warningSameNotEvaluated = (log, one) => {
  const description = 'WARNING from Dialogues KM: For the "X is Y" type phrase implement a same handler.'
  const match = `({context}) => context.marker == '${one.marker}' && context.same && <other conditions as you like>`
  const apply = '({context}) => <do stuff... context.same is the other value>; context.sameWasProcessed = true'
  const input = indent(JSON.stringify(one, null, 2), 2)
  const message = `${description}\nThe semantic would be\n  match: ${match}\n  apply: ${apply}\nThe input context would be:\n${input}\n`
  log(indent(message, 4))
}

const listorama = (type) => {
  return [
      { context: [[type, 0], ['list', 0], [type, 0]], choose: 0 },
      { context: [[type, 1], ['list', 0], [type, 0]], choose: 0 },
      { context: [[type, 1], ['list', 0], [type, 1]], choose: 0 },
  ]
}


// TODO implement what / what did you say ...
const config = {
  name: 'dialogues',
  operators: [
    "(<thatVerb|that> (verb/0))",
    "([makeObject] (word))",
    "([setIdSuffix] (word))",
    "([resetIdSuffix])",

    "(([queryable]) [is|] ([queryable|]))",
    "([isQuery|] ([queryable]) ([queryable]))",
    // "(([queryable]) [is:isEdBridge|is,are] ([isEdAble|]))",
    // who is the car owned by
    "(([queryable]) [(<isEd|> ([isEdAble|]))])",

    /* TODO investigate this:
      {"pattern":"(([ownee])^ <owned|owned> ([by] ([owner])?))","uuid":"people1"}
      {"pattern":"(([isEdee])^ <isEdAble|> ([by] ([isEder])?))","uuid":"dialogues2"}
    */
    "(([isEdee])^ <isEdAble|> ([by] ([isEder])?))",
    "([isEdee|])",
    "([isEder|])",

    // "([nevermind])",
    // { pattern: "([nevermindTestSetup] (allowed))", development: true },
    "([why])",
    "([reason])",
    // "([thisitthat|])",
    // "([it])",
    // "([this])",
    // "([that])",

    "(<what> ([whatAble|]))",
    "([what:optional])",
    // "(<the|> ([theAble|]))",
    // "(<a|a,an> ([theAble|]))",
    // "([unknown])",

    "([be] ([briefOrWordy|]))",

    "([([canBeQuestion])])",
    "(([canBeQuestion/1,2]) <questionMark|>)",
    // "(([is/2]) <questionMark|>)",

    "(([what]) [(<does|> ([doesAble|]))])",
    "([canBeDoQuestion])",
    "(<does|> ([canBeDoQuestion/0,1]))",
    // make what is it work <<<<<<<<<<<<<<<<<<<<<<<, what is greg
    // joe is a person the age of joe ...
    //"arm them, what, the phasers"
    //greg is a first name
    "([yesno|])",
    { pattern: "([debug23])" },

    "([to] ([toAble|]))",
  ],
  associations: {
    positive: [
      { context: [['unknown', 0], ['isEdAble', 0]], choose: 1 },
      { context: [['isQuery', 0], ['a', 0], ['unknown', 0], ['a', 0], ['unknown', 0]], choose: { index: 0, increment: true } },

      { context: [["unknown",0],["isEd",0],["isEdAble",0],["by",0],["unknown",0]], choose: { index: 0, increment: true } },
      { context: [["unknown",0],["isEd",0],["isEdAble",0],["by",1]], choose: { index: 0, increment: true } },
      { context: [["unknown",0],["isEd",0],["isEdAble",0]], choose: { index: 0, increment: true } },


      // ...listorama('unknown'),
      // ...listorama('queryable'),
      { context: [['unknown', 0], ['list', 0], ['unknown', 0]], choose: 0 },
      { context: [['unknown', 0], ['list', 0], ['unknown', 1]], choose: 0 },
      { context: [['unknown', 1], ['list', 0], ['unknown', 0]], choose: 0 },
      { context: [['unknown', 1], ['list', 0], ['unknown', 1]], choose: 0 },

      { context: [['queryable', 0], ['list', 0], ['unknown', 0]], choose: 1 },
      { context: [['queryable', 0], ['list', 0], ['unknown', 1]], choose: 1 },
      { context: [['queryable', 1], ['list', 0], ['unknown', 0]], choose: 1 },
      { context: [['queryable', 1], ['list', 0], ['unknown', 1]], choose: 1 },

      { context: [['unknown', 0], ['list', 0], ['queryable', 0]], choose: 2 },
      { context: [['unknown', 0], ['list', 0], ['queryable', 1]], choose: 2 },
      { context: [['unknown', 1], ['list', 0], ['queryable', 0]], choose: 2 },
      { context: [['unknown', 1], ['list', 0], ['queryable', 1]], choose: 2 },

      { context: [['queryable', 0], ['list', 0], ['queryable', 0]], choose: 0 },
      { context: [['queryable', 0], ['list', 0], ['queryable', 1]], choose: 0 },
      { context: [['queryable', 1], ['list', 0], ['queryable', 0]], choose: 0 },
      { context: [['queryable', 1], ['list', 0], ['queryable', 1]], choose: 0 },
    ]
  },
  bridges: [
    {
      id: 'thatVerb',
      before: ['verb'],
      // bridge: "{ ...after[0], verb: after[0], that: operator, generate: ['that', 'verb'], localPriorities: { before: [\"verb\"] }, bridge_override: { operator: after[0].marker, bridge: '{ ...bridge.subject, postModifiers: [\"conditions\"], generate: append(before[0].generate, concatm(\"thatClause.\", operator.generate)), thatClause: bridge, conditions: append(after[0].conditions, [bridge]) }' } }",
      // bridge: "{ ...after[0], verb: after[0], that: operator, generate: ['that', 'verb'], localPriorities: { before: [\"verb\"] }, bridge_override: { operator: after[0].marker, bridge: '{ ...bridge.subject, postModifiers: [\"conditions\"], generate: concatm(\"thatClause.\", bridge.generate), thatClause: bridge, conditions: append(bridge.subject.conditions, [bridge]) }' } }",
      bridge: "{ ...after[0], verb: after[0], that: operator, generate: ['that', 'verb'], localPriorities: { actLike: [\"subordinatedVerb\", 0] }, bridge_override: { operator: after[0].marker, bridge: '{ ...bridge.subject, postModifiers: [\"conditions\"], modifiers: [], generate: concatm(\"thatClause.\", bridge.generate), thatClause: bridge, conditions: append(bridge.subject.conditions, [bridge]) }' } }",
    },

    {
      id: 'queryable',
      children: [ 'negatable' ],
    },
    {
      id: 'queryable',
      level: 1,
      isA: ['listable'],
    },
    {
      id: 'makeObject',
      bridge: "{ ...next(operator), object: after[0] }",
      generatorp: async ({context, gp}) => `${context.word} ${await gp(context.object)}`,
      semantic: async ({config, context, api}) => {
			  await api.makeObject({ context: context.object, config, types: [] })
      }
    },
    {
      id: 'setIdSuffix',
      bridge: "{ ...next(operator), suffix: after[0] }",
      generatorp: async ({context, gp}) => `${context.word} ${await gp(context.suffix)}`,
      semantic: ({context, api}) => {
        api.setIdSuffix(context.suffix.text)
      }
    },
    {
      id: 'resetIdSuffix',
      semantic: ({context, api}) => {
        api.setIdSuffix('')
      }
    },

    { 
      id: "by", 
      bridge: "{ ...next(operator), object: after[0] }", 
      localHierarchy: [['unknown', 'isEder']],
      optional: { 1: "{ marker: 'unknown', implicit: true, concept: true }", }, 
    },

    { id: "debug23" },
    { 
      id: "what", 
      optional: "{ ...next(operator), query: ['what'], determined: true }", 
      bridge: "{ ...after, query: ['what'], modifiers: ['what'], what: operator }" 
    },
    { id: "whatAble" },

    // context.instance == variables.instance (unification)
    {   
        where: where(),
        id: "to", 
        level: 0, 
        isA: ['preposition'],
        bridge: "{ ...next(operator), toObject: after[0] }",
        generatorp: async ({context, gp}) => {
          return `to ${await gp(context.toObject)}`
        },
    },
    { id: "toAble" },

    { id: "be", level: 0, bridge: "{ ...next(operator), type: after[0] }" },
    { id: "briefOrWordy" },

    { id: "yesno" },
    { id: "canBeQuestion", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeQuestion", level: 1, bridge: "{ ...next(operator) }" },
    { id: "questionMark", level: 0, bridge: "{ ...before[0], query: [before.marker] }" },
    { 
      id: "isEd", 
      level: 0, 
      localHierarchy: [['unknown', 'isEder'], ['unknown', 'isEdee']],
      bridge: "{ number: operator.number, ...context, [context.subject].number: operator.number }" 
    },
    // { id: "isEd", level: 0, bridge: "{ ...context }" },
    { id: "isEdAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "isEdAble", level: 1, bridge: "{ ...next(operator) }" },
    { id: "isEdee" },
    { id: "isEder" },
    { 
      id: "is",
      localHierarchy: [['unknown', 'queryable']],  
      bridge: "{ ...next(operator), one: { number: operator.number, ...before[0] }, two: after[0] }", 
      isA: ['verb'],
    },
    { 
      id: "is", 
      level: 1, 
      localHierarchy: [['unknown', 'queryable']],  
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "isQuery",
      localHierarchy: [['unknown', 'queryable']],  
      bridge: "{ ...operator, marker: operator('is', 1), one: after[0], two: after[1], query: true, generate: [operator, 'one', 'two'] }" ,
      isA: ['verb'],
    },

    { id: "canBeDoQuestion", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeDoQuestion", level: 1, bridge: "{ ...next(operator) }" },
    { id: "canBeDoQuestion", level: 2, bridge: "{ ...next(operator) }" },
    { id: "doesAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "doesAble", level: 1, bridge: "{ ...next(operator), before: before[0] }" },
    { id: "does", level: 0, bridge: "{ query: true, what: operator.marker, ...context, number: operator.number, object.number: operator.number }*" },

    /*
    { 
      id: 'the', 
      level: 0, 
      bridge: '{ ...after[0], focusableForPhrase: true, pullFromContext: true, concept: true, wantsValue: true, determiner: "the", modifiers: append(["determiner"], after[0].modifiers)}' 
    },
    { 
      id: "a", 
      level: 0, 
      // bridge: "{ ...after[0], pullFromContext: false, instance: true, concept: true, number: 'one', wantsValue: true, determiner: operator, modifiers: append(['determiner'], after[0].modifiers) }" 
      bridge: "{ ...after[0], pullFromContext: false, concept: true, number: 'one', wantsValue: true, determiner: operator, modifiers: append(['determiner'], after[0].modifiers) }" 
    },
    */
    /*
    { 
      id: "theAble", 
      children: ['noun'],
      bridge: "{ ...next(operator) }" 
    },
    */

    // TODO make this hierarchy thing work
    /*
    { 
      id: "thisitthat", 
      level: 0, 
      isA: ['queryable'], 
      before: ['verby'],
      bridge: "{ ...next(operator) }" 
    },
    */
    { 
      id: "why", 
      level: 0, 
      bridge: "{ ...next(operator), pullFromContext: true, types: ['reason'], isResponse: true }" 
    },
    { 
      id: "reason", 
      isA: ['theAble', 'queryable'], 
    },
    /*
    { 
      id: "it", 
      level: 0, 
      isA: ['thisitthat'], 
      bridge: "{ ...next(operator), pullFromContext: true, unknown: true, determined: true }" 
    },
    { 
      id: "this", 
      level: 0, 
      isA: ['thisitthat'], 
      bridge: "{ ...next(operator), unknown: true, pullFromContext: true }" 
    },
    { 
      id: "that", 
      level: 0, 
      isA: ['thisitthat'], 
      bridge: "{ ...next(operator), unknown: true, pullFromContext: true }" 
    },
    */
  ],
  words: {
    "literals": {
      "?": [{"id": "questionMark", "initial": "{}" }],
      // "the": [{"id": "the", "initial": "{ modifiers: [] }" }],
      "who": [{"id": "what", "initial": "{ modifiers: [], query: true }" }],
      "yes": [{"id": "yesno", "initial": "{ value: true }" }],
      "no": [{"id": "yesno", "initial": "{ value: false }" }],
      "brief": [{"id": "briefOrWordy", "initial": "{ value: 'brief' }" }],
      "wordy": [{"id": "briefOrWordy", "initial": "{ value: 'wordy' }" }],
      "does": [{"id": "does", "initial": "{ number: 'one' }" }],
      "do": [{"id": "does", "initial": "{ number: 'many' }" }],
      "is": [
        {"id": "is", "initial": "{ number: 'one' }" }, 
        {"id": "isQuery", "initial": "{ number: 'one' }" }, 
        {"id": "isEd", "initial": "{ number: 'one' }" }
      ],
      "are": [
        {"id": "is", "initial": "{ number: 'many' }" }, 
        {"id": "isQuery", "initial": "{ number: 'many' }" }, 
        {"id": "isEd", "initial": "{ number: 'many' }" }
      ],
    }
  },

  floaters: ['query', 'associations'],

  priorities: [
    { "context": [['is', 0], ['means', 0], ], "choose": [0] },
    { "context": [['is', 0], ['means', 0], ], "choose": [0] },
    { "context": [["isEdAble",0], ["isEd",0],], "choose": [0] },
    { "context": [['isEd', 0], ['means', 0], ], "choose": [0] },
    { "context": [['isEdAble', 0], ['is', 0], ], "choose": [0] },
    { "context": [['isEdAble', 0], ['is', 1], ], "choose": [0] },
  ],
  hierarchy: [
    ['doubleQuote', 'queryable'],
    ['it', 'pronoun'],
    ['this', 'pronoun'],
    ['questionMark', 'punctuation'],
    // ['questionMark', 'isEd'],
    ['a', 'article'],
    ['the', 'article'],
    // ['unknown', 'theAble'],
    ['theAble', 'queryable'],
    // ['unknown', 'queryable'],
    ['it', 'queryable'],
    ['what', 'queryable'],
    ['whatAble', 'queryable'],
    ['negatable', 'queryable'],
    ['is', 'canBeQuestion'],
    ['it', 'toAble'],
    ['this', 'queryable'],

    ['listable', 'theAble'],
  ],
  debug: false,
  version: '3',
  generators: [
    {
      where: where(),
      notes: "handle making responses brief",
      match: ({context, objects}) => (context.topLevel || context.isResponse) && objects.brief && !context.briefWasRun,
      apply: async ({context, g}) => {
        const focussed = focus(context)
        context.briefWasRun = true
        return await g(focussed)
      },
      priority: -2,
    },
    {
      where: where(),
      notes: "unknown ",
      match: ({context}) => context.marker == 'unknown' && context.implicit,
      apply: ({context}) => '',
    },
    {
      where: where(),
      notes: "unknown answer default response",
      match: ({context}) => context.marker == 'answerNotKnown',
      apply: ({context}) => `that is not known`,
    },
    {
      where: where(),
      notes: "be brief or wordy",
      match: ({context}) => context.marker == 'be',
      apply: ({context}) => `be ${context.type.word}`,
    },
    /*
    {
       notes: 'paraphrase: plural/singular',
       priority: -1,
      where: where(),
       match: ({context}) => context.paraphrase && context.word
       apply: ({context, g}) => { return { "self": "your", "other": "my" }[context.value] },
    },
    */
    {
      where: where(),
      match: ({context}) => context.marker === 'error' && context.paraphrase,
      apply: ({context, gp}) => gp(context.context)
    },
    {
      where: where(),
      match: ({context}) => context.marker === 'idontknow',
      apply: ({context}) => "i don't know",
    },
    {
      where: where(),
      match: ({context}) => context.marker == 'yesno',
      apply: ({context}) => context.value ? 'yes' : 'no',
      priority: -1,
      // debug: 'call11',
    },
    {
      where: where(),
      match: ({context}) => !context.paraphrase && context.evalue && context.evalue.marker == 'yesno',
      apply: ({context}) => context.evalue.value ? 'yes' : 'no',
      priority: -1,
    },

    {
      where: where(),
      notes: 'paraphrase a queryable response',
      // || context.evalue.paraphrase -> when the evalue acts as a paraphrase value
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.evalue && (!context.paraphrase || context.evalue.paraphrase),
      apply: async ({context, g}) => {
        return await g(context.evalue)
      }
    },
    {
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.isSelf && context.subject == 'my',
      apply: ({context}) => `your ${context.word}`
    },
    { 
      where: where(),
      match: ({context, hierarchy}) => ['it', 'what'].includes(context.marker) && context.paraphrase, 
      apply: ({context}) => `${context.word}`
    },
    {
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.isSelf && context.subject == 'your',
      apply: ({context}) => `my ${context.word}`
    },
    { 
      where: where(),
      match: ({context, hierarchy}) => ['my', 'your'].includes(context.subject) && hierarchy.isA(context.marker, 'queryable') && context.paraphrase, 
      apply: ({context}) => `${context.subject} ${context.marker}`
    },
    {
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.subject,
      apply: ({context}) => `${context.subject} ${context.word}`
    },
    { 
      where: where(),
      match: ({context}) => context.marker == 'name' && !context.isQuery && context.subject, 
      apply: ({context}) => `${context.subject} ${context.word}` 
    },
    {
      where: where(),
      match: ({context}) => context.evalue && context.evalue.verbatim && !context.paraphrase,
      apply: ({context}) => context.evalue.verbatim,
    },
    {
      where: where(),
      match: ({context}) => context.isResponse && context.verbatim && !context.paraphrase,
      apply: ({context}) => context.verbatim,
      priority: -1,
    },
    { 
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'canBeQuestion') && context.paraphrase && context.topLevel && context.query,
      apply: async ({context, gp}) => {
        return `${await gp({...context, topLevel: undefined})}?` 
      },
      priority: -1,
    },
    { 
      where: where(),
      notes: "x is y",
      match: ({context, hierarchy}) => { return hierarchy.isA(context.marker, 'is') && context.paraphrase },
      apply: async ({context, g, gp}) => {
        return `${await g({ ...context.one, paraphrase: true })} ${context.word} ${await gp(context.two)}` 
      }
    },
    { 
      where: where(),
      notes: 'is with a response defined',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.evalue,
      apply: async ({context, g, gs}) => {
        const response = context.evalue;
        const concept = response.concept;
        if (concept) {
          concept.paraphrase = true
          concept.isSelf = true
          const instance = await g(response.instance)
          return `${await g(concept)} ${context.word} ${instance}` 
        } else {
          if (Array.isArray(response)) {
            return `${await gs(response)}` 
          } else {
            return `${await g(response)}` 
          }
        }
      }
    },
    { 
      where: where(),
      notes: 'x is y (not a response)',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && !context.evalue,
      apply: async ({context, g, gp, gr, callId}) => {
        if ((context.two.evalue || {}).marker == 'answerNotKnown') {
          return await g(context.two.evalue)
        }

        if (!context.isResponse) {
          return `${await gp(context.one)} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${await g(context.two)}`
        }

        const hasFocus = (property) => {
          if (context.focusableForPhrase) {
            return true
          }
          if (context.focusable && context.focusable.includes(property) && context[property].focus) {
            return true
          }
        }
        let focus;
        if (context.two.hierarchy && !isMany(context.two)) {
          focus = 'one'
        } else if (context.one.focusableForPhrase && !context.two.focusableForPhrase) {
          focus = 'one'
        } else if (!context.one.focusableForPhrase && context.two.focusableForPhrase) {
          focus = 'two'
        } else if (hasFocus('two')) {
          focus = 'two'
        } else {
          focus = 'one'
        }
        // greg101
        if (focus == 'one') {
          return `${await g(context.two)} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${await gp(context.one)}`
        } else {
          // TODO fix this using the assumed and that whole mess. change isResponse to useValue
          if (context.isResponse) {
            return `${await gp(context.one, { responding: true })} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${await g(context.two)}`
          } else {
            return `${await gp(context.one)} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${await gr(context.two)}`
          }
        }
      },
    },
  ],

  semantics: [
    {
      where: where(),
      todo: 'debug23',
      match: ({context}) => context.marker == 'debug23',
      apply: ({context, hierarchy}) => {
        debugger // eslint-disable-line no-debugger
        debugger // eslint-disable-line no-debugger
      },
    },
    { 
      where: where(),
      todo: 'be brief or wordy',
      match: ({context}) => context.marker == 'be',
      apply: ({context, api}) => {
        api.setBrief( context.type.value == 'brief' )
      },
    },
    {
      where: where(),
      match: ({context}) => context.marker === 'error',
      apply: async ({context, gp}) => {
        context.evalue = "That is not known"
        if (context.reason) {
          context.evalue += ` because ${await gp(context.reason)}`
        }
        context.isResponse = true
      }
    },
//  { 
//    where: where(),
//    notes: 'pull from context',
//    // match: ({context}) => context.marker == 'it' && context.pullFromContext, // && context.value,
//    match: ({context, callId}) => false && context.pullFromContext && !context.same, // && context.value,
//    apply: async ({callId, context, kms, e, log, retry}) => {
//      if (true) {
//        /*
//                 {
//                    "marker": "unknown",
//                    "range": {
//                      "start": 65,
//                      "end": 73
//                    },
//                    "word": "worth",
//                    "text": "the worth",
//                    "value": "worth",
//                    "unknown": true,
//                    "types": [
//                      "unknown"
//                    ],
//                    "pullFromContext": true,
//                    "concept": true,
//                    "wantsValue": true,
//                    "determiner": "the",
//                    "modifiers": [
//                      "determiner"
//                    ],
//                    "evaluate": true
//                  }

//        */
//        context.value = kms.stm.api.mentions(context)
//        if (!context.value) {
//          // retry()
//          context.value = { marker: 'answerNotKnown' }
//          return
//        }
//        
//        const instance = await e(context.value)
//        if (instance.evalue && !instance.edefault) {
//          context.value = instance.evalue
//        }
//        if (context.evaluate) {
//          context.evalue = context.value
//        }
//    },
//  },
    { 
      where: where(),
      notes: 'what x is y?',
      /*
        what type is object (what type is pikachu)   (the type is typeValue)
        what property is object (what color are greg's eyes)
        object is a type (is greg a human) // handled by queryBridge
      */

      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.query,
      apply: async ({context, s, log, km, objects, e}) => {
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
        // km('dialogues').api.mentioned(concept)
        // TODO wtf is the next line?
        value = JSON.parse(JSON.stringify(value))
        const instance = await e(value)
        if (false && instance.evalue) {
          km('stm').api.mentioned({ context: value })
        }
        if (instance.verbatim) {
          context.evalue = { verbatim: instance.verbatim }
          context.isResponse = true
          return
        }
        // instance.focusable = ['one', 'two']
        // concept = JSON.parse(JSON.stringify(value)) 
        concept = _.cloneDeep(value) 
        concept.isQuery = undefined
        // greg101
        // instance.focusableForPhrase = true
        instance.focus = true
        if (concept.hierarchy) {
          concept.focusableForPhrase = true
        }
        // concept.focus = true

        const many = isMany(concept) || isMany(instance)
        const evalue = {
          "default": true,
          "marker": "is",
          "one": concept,
          "two": instance,
          "focusable": ['two', 'one'],
          "word": many ? "are" : "is",
          "number": many ? "many" : undefined,
        }
        context.evalue = evalue
        context.isResponse = true
      }
    },
    { 
      where: where(),
      notes: 'x is y?',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.query,
      apply: ({context, log}) => {
        warningIsANotImplemented(log, context)
        context.evalue = {
          verbatim: "I don't know"
        }
        context.isResponse = true
      }
    },

    // statement
    { 
      /*
         a car is a vehicle           isA
         cars are vehicles            isA
         the ford is a car            isA
         a name is car                isA (reverse)
         the formula is x + 5         not isA
         x is 5                       not isA
         worth is price * quantity    not isA
         the name is cars             not isA

      */
      where: where(),
      notes: 'x is y. handles x is a kind of y or x = y in the stm',
      match: ({context}) => context.marker == 'is' && !context.query && context.one && context.two,
      apply: async ({context, s, log, api, kms, config}) => {
        // const oneZero = { ...context.one }
        // const twoZero = { ...context.two }

        const one = context.one;
        const two = context.two;
        one.same = two;
        const onePrime = await s(one)
        if (!onePrime.sameWasProcessed) {
          warningSameNotEvaluated(log, one)
        } else {
          if (onePrime.evalue) {
            context.evalue = onePrime.evalue
            context.isResponse = true
          }
        }
        one.same = undefined
        let twoPrime;
        if (!onePrime.sameWasProcessed) {
          two.same = one
          twoPrime = await s(two)
          if (!twoPrime.sameWasProcessed) {
            warningSameNotEvaluated(log, two)
          } else {
            if (twoPrime.evalue) {
              context.evalue = twoPrime.evalue
            }
          }
          two.same = undefined
        }

        // if not isA add to stm
        if (!onePrime.sameWasProcessed && !twoPrime.sameWasProcessed) {
          for (const child of propertyToArray(one)) {
            await api.makeObject({ context: child, config, types: context.two.types || [] })
            kms.stm.api.setVariable(child.value, two)
            kms.stm.api.mentioned({ context: child, value: two })
          }
        }
      }
    },
    {
      where: where(),
      notes: 'get variable from stm',
      // match: ({context, kms}) => !context.determiner && context.evaluate && kms.stm.api.getVariable(context.value) != context.value,
      match: ({context, kms}) => context.evaluate && kms.stm.api.getVariable(context.value) != context.value,
      // match: ({context, kms}) => context.evaluate,
      priority: -1,
      apply: async ({context, kms, e}) => {
        const api = kms.stm.api
        context.value = api.getVariable(context.value)
        if (context.value && context.value.marker) {
          context.evalue = await e(context.value)
        }
        context.focusableForPhrase = true
      }
    },
  ],
};

const initializer = ({objects, config, isModule}) => {
  /* TODO add this beck in. some stuff from config needs to be here
  config.addArgs((args) => ({ 
    e: (context) => config.api.getEvaluator(args.s, args.log, context),
  }))
  */
  config.addArgs(({config, api, isA}) => ({ 
    toScopedId: (context) => {
      return api('dialogues').toScopedId(context)
    },
    addWords: (id, word, additional) => {
      for (const props of words(word, { ...additional })) {
        config.addWord(props.word, { id, initial: JSON.stringify(props) }) 
      }
    },
    values: propertyToArray,
  }))
  objects.mentioned = []
  objects.variables = {
  }
  if (isModule) {
  } else {
    config.addWord("canbedoquestion", { id: "canBeDoQuestion", "initial": "{}" })
    config.addWord("doesable", { id: "doesAble", "initial": "{}" })
  }
}

knowledgeModule( { 
  config,
  includes: [articles, gdefaults, sdefaults, conjunction, asking, pos, negation, stm, meta, punctuation],
  initializer,
  api: () => new API(),

  module,
  description: 'framework for dialogues',
  newWay: true,
  test: {
    name: './dialogues.test.json',
    contents: dialogues_tests,
    checks: {
            objects: ['idSuffix'],
            ...defaultContextCheck(['one', 'two']),
          },

  },
})
