const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const meta = require('./meta.js')
const gdefaults = require('./gdefaults.js')
const sdefaults = require('./sdefaults.js')
const pos = require('./pos.js')
const punctuation = require('./punctuation.js')
const stm = require('./stm.js')
const _ = require('lodash')
const { API } = require('./helpers/dialogues')
const { isMany } = require('./helpers')
const dialogues_tests = require('./dialogues.test.json')
const { indent, focus } = require('./helpers')
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

// TODO implement what / what did you say ...
let configStruct = {
  name: 'dialogues',
  operators: [
    "(([queryable]) [is|] ([queryable|]))",
    "([is:queryBridge|] ([queryable]) ([queryable]))",
    // "(([queryable]) [is:isEdBridge|is,are] ([isEdAble|]))",
    "(([queryable]) [(<isEd|> ([isEdAble|]))])",

    "([why])",
    "([reason])",
    "([thisitthat|])",
    "([it])",
    "([this])",
    "([that])",

    "(<what> ([whatAble|]))",
    "([what:optional])",
    "(<the|> ([theAble|]))",
    "(<a|a,an> ([theAble|]))",
    "([unknown])",
    "([not] ([notAble|]))",

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
    "(([theAble|]) [list|and] ([theAble|]))",
    "([yesno|])",
    "(([isEdee])^ <isEdAble|> ([by] ([isEder])?))",
    "([isEdee|])",
    "([isEder|])",
    { pattern: "([debug23])" },

    "([to] ([toAble|]))",
  ],
  associations: {
    negative: [
      // [['isEd', 0], ['unknown', 0]],
      // [['isEd', 0], ['unknown', 1]],
      // [['is', 0], ['means', 0]],
    ],
    positive: [
      // [['is', 0], ['unknown', 0]],
      // [['is', 0], ['unknown', 1]],
      // [['isEd', 0], ['means', 0]],
      [['isEdee', 0], ['isEd', 0], ['isEder', 0], ['by', 0]],
      [['isEdee', 0], ['isEd', 0], ['isEdAble', 0]],
      [['unknown', 1], ['isEd', 0], ['isEdAble', 0]],
      [['unknown', 0], ['isEd', 0], ['isEdAble', 0]],
      [["isEd",0],["unknown",1],["isEdAble",0]],

    ]
  },
  bridges: [
    { id: "by", level: 0, bridge: "{ ...next(operator), object: after[0] }", optional: { 'isEder': "{ marker: 'unknown', implicit: true, concept: true }", }, },

    { id: "debug23", level: 0, bridge: "{ ...next(operator) }" },
    // { id: "what", level: 0, bridge: "{ ...next(operator), ...after[0], query: ['what'], determined: true }" },
    { id: "what", level: 0, optional: "{ ...next(operator), query: ['what'], determined: true }", bridge: "{ ...after, query: ['what'], modifiers: ['what'], what: operator }" },
    { id: "whatAble", level: 0, bridge: "{ ...next(operator) }" },

    // context.instance == variables.instance (unification)
    {id: "list", level: 0, selector: {match: "same", left: [ { pattern: '($type && context.instance == variables.instance)' } ], right: [ { pattern: '($type && context.instance == variables.instance)' } ], passthrough: true}, bridge: "{ ...next(operator), listable: true, isList: true, value: append(before, after) }"},
    {id: "list", level: 1, selector: {match: "same", left: [ { pattern: '($type && context.instance == variables.instance)' } ], passthrough: true}, bridge: "{ ...operator, value: append(before, operator.value) }"},

    {   
        where: where(),
        id: "to", 
        level: 0, 
        bridge: "{ ...next(operator), toObject: after[0] }",
        generatorp: ({context, gp}) => {
          return `to ${gp(context.toObject)}`
        },
    },
    { id: "toAble", level: 0, bridge: "{ ...next(operator) }" },

    { id: "be", level: 0, bridge: "{ ...next(operator), type: after[0] }" },
    { id: "briefOrWordy", level: 0, bridge: "{ ...next(operator) }" },

    { id: "notAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "not", level: 0, bridge: "{ ...after, negated: true }" },

    { id: "yesno", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeQuestion", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeQuestion", level: 1, bridge: "{ ...next(operator) }" },
    { id: "unknown", level: 0, bridge: "{ ...next(operator), unknown: true, dead: true }" },
    { id: "unknown", level: 1, bridge: "{ ...next(operator) }" },
    { id: "queryable", level: 0, bridge: "{ ...next(operator) }" },
    { id: "questionMark", level: 0, bridge: "{ ...before[0], query: [before.marker] }" },
    // { id: "isEd", level: 0, bridge: "{ ...context, query: true }" },
    // gregbug
    // context.subject == ['owner'] but could be list of properties
    // { id: "isEd", level: 0, bridge: "{ number: operator.number, ...context, [subject].number: operator.number }" },
    // { id: "isEd", level: 0, bridge: "{ number: operator.number, ...context, properties(subject).number: operator.number }" },
    // NO or symlink subject: link(current.ownee)  // any other operator...
    // NO { id: "isEd", level: 0, bridge: "{ number: operator.number, ...context, subject.number: operator.number }" },
    { id: "isEd", level: 0, bridge: "{ number: operator.number, ...context, [context.subject].number: operator.number }" },
    // { id: "isEd", level: 0, bridge: "{ ...context }" },
    { id: "isEdAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "isEdAble", level: 1, bridge: "{ ...next(operator) }" },
    { id: "isEdee", level: 0, bridge: "{ ...next(operator) }" },
    { id: "isEder", level: 0, bridge: "{ ...next(operator) }" },
    { id: "is", level: 0, 
            bridge: "{ ...next(operator), one: { number: operator.number, ...before[0] }, two: after[0] }", 
            isA: ['verby'],
            queryBridge: "{ ...next(operator), one: after[0], two: after[1], query: true }" ,
    },
    { id: "is", level: 1, bridge: "{ ...next(operator) }" },

    { id: "canBeDoQuestion", level: 0, bridge: "{ ...next(operator) }" },
    { id: "canBeDoQuestion", level: 1, bridge: "{ ...next(operator) }" },
    { id: "canBeDoQuestion", level: 2, bridge: "{ ...next(operator) }" },
    { id: "doesAble", level: 0, bridge: "{ ...next(operator) }" },
    { id: "doesAble", level: 1, bridge: "{ ...next(operator), before: before[0] }" },
    { id: "does", level: 0, bridge: "{ query: true, what: operator.marker, ...context, number: operator.number, object.number: operator.number }*" },

    { 
      id: 'the', 
      level: 0, 
      bridge: '{ ...after[0], focusableForPhrase: true, pullFromContext: true, concept: true, wantsValue: true, determiner: "the", modifiers: append(["determiner"], after[0].modifiers)}' 
    },
    { id: "a", level: 0, bridge: "{ ...after[0], pullFromContext: false, concept: true, number: 'one', wantsValue: true, determiner: operator, modifiers: append(['determiner'], after[0].modifiers) }" },
    { 
      id: "theAble", 
      children: ['noun'],
      bridge: "{ ...next(operator) }" 
    },

    // TODO make this hierarchy thing work
    { 
      id: "thisitthat", 
      level: 0, 
      isA: ['queryable'], 
      before: ['verby'],
      bridge: "{ ...next(operator) }" 
    },
    { 
      id: "why", 
      level: 0, 
      bridge: "{ ...next(operator), pullFromContext: true, types: ['reason'], isResponse: true }" 
    },
    { 
      id: "reason", 
      level: 0, 
      isA: ['theAble', 'queryable'], 
      bridge: "{ ...next(operator) }" 
    },
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
  ],
  words: {
    "?": [{"id": "questionMark", "initial": "{}" }],
    "the": [{"id": "the", "initial": "{ modifiers: [] }" }],
    "who": [{"id": "what", "initial": "{ modifiers: [], query: true }" }],
    "yes": [{"id": "yesno", "initial": "{ value: true }" }],
    "no": [{"id": "yesno", "initial": "{ value: false }" }],
    "brief": [{"id": "briefOrWordy", "initial": "{ value: 'brief' }" }],
    "wordy": [{"id": "briefOrWordy", "initial": "{ value: 'wordy' }" }],
    "does": [{"id": "does", "initial": "{ number: 'one' }" }],
    "do": [{"id": "does", "initial": "{ number: 'many' }" }],
    "is": [{"id": "is", "initial": "{ number: 'one' }" }, {"id": "isEd", "initial": "{ number: 'one' }" }],
    "are": [{"id": "is", "initial": "{ number: 'many' }" }, {"id": "isEd", "initial": "{ number: 'many' }" }],
  },

  floaters: ['query'],
  priorities: [
    [['means', 0], ['is', 0]],
    [["does",0],["what",0]],
    [["is",1],["is",0]],
    [["isEd",0],["isEdAble",0]],
    [['is', 0], ['does', 0], ['a', 0]],
    [['means', 0], ['isEd', 0]],
    [['isEdAble', 0], ['articlePOS', 0]],
    [['is', 0], ['isEdAble', 0]],
    [['is', 1], ['isEdAble', 0]],
  ],
  hierarchy: [
    ['it', 'pronoun'],
    ['this', 'pronoun'],
    ['questionMark', 'punctuation'],
    // ['questionMark', 'isEd'],
    ['a', 'articlePOS'],
    ['the', 'articlePOS'],
    ['unknown', 'notAble'],
    ['unknown', 'theAble'],
    ['unknown', 'queryable'],
    ['it', 'queryable'],
    ['what', 'queryable'],
    ['whatAble', 'queryable'],
    ['is', 'canBeQuestion'],
    ['it', 'toAble'],
    ['this', 'queryable'],
  ],
  debug: false,
  version: '3',
  generators: [
    {
      where: where(),
      notes: "handle making responses brief",
      match: ({context, objects}) => (context.topLevel || context.isResponse) && objects.brief && !context.briefWasRun,
      apply: ({context, g}) => {
        const focussed = focus(context)
        context.briefWasRun = true
        return g(focussed)
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
    /*
     * modifiers = <list of properties>
     */
    {
      where: where(),
      //({context}) => context.paraphrase && context.modifiers,
      match: ({context}) => context.paraphrase && (context.modifiers || context.postModifiers),
      apply: ({context, g}) => {
        const text = []
        for (modifier of (context.modifiers || [])) {
          text.push(g(context[modifier]))
        }
        // text.push(context.word)
        if (context.postModifiers) {
          text.push(g({...context, number: 'one', postModifiers: undefined, modifiers: undefined}))
        } else {
          text.push(g({...context, postModifiers: undefined, modifiers: undefined}))
        }
        for ([index, modifier] of (context.postModifiers || []).entries()) {
          if (index == context.postModifiers.length - 1) {
            text.push(g({...context[modifier], number: context.number}))
          } else {
            text.push(g(context[modifier]))
          }
        }
        return text.join(' ')
      }
    },

    {
      where: where(),
      notes: 'handle lists with yes no',
      // ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value,
      // ({context, hierarchy}) => context.marker == 'list' && context.value,
      match: ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value && context.value.length > 0 && context.value[0].marker == 'yesno',
      apply: ({context, g, gs}) => {
        return `${g(context.value[0])} ${gs(context.value.slice(1), ', ', ' and ')}`
      }
    },

    {
      where: where(),
      notes: 'handle lists',
      // ({context, hierarchy}) => context.marker == 'list' && context.paraphrase && context.value,
      // ({context, hierarchy}) => context.marker == 'list' && context.value,
      match: ({context, hierarchy}) => context.marker == 'list' && context.value,
      apply: ({context, gs}) => {
        if (context.newLinesOnly) {
          return gs(context.value, '\n')
        } else {
          return gs(context.value, ', ', ' and ')
        }
      }
    },

    {
      where: where(),
      notes: 'paraphrase a negation',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'notAble') && context.negated, // && !context.isQuery && !context.paraphrase && context.value,
      apply: ({context, g}) => {
        context.negated = false
        const result = g(context.value)
        context.negated = true
        return `not ${result}`
      }
    },

    {
      where: where(),
      notes: 'paraphrase a queryable response',
      // || context.evalue.paraphrase -> when the evalue acts as a paraphrase value
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.evalue && (!context.paraphrase || context.evalue.paraphrase),
      apply: ({context, g}) => {
        return g(context.evalue)
      }
    },
    /* dup of one above
    {
      where: where(),
      notes: 'paraphrase a queryable',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && !context.paraphrase && context.evalue,
      apply: ({context, g}) => {
        const oldValue = context.evalue.paraphrase
        const result = g(context.evalue)
        context.evalue.paraphrase = oldValue
        return result
      }
    },
    */
    {
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.isSelf && context.subject == 'my',
      apply: ({context}) => `your ${context.word}`
    },
    { 
      where: where(),
      match: ({context, hierarchy}) => ['it', 'what'].includes(context.marker) && context.paraphrase, 
      apply: ({g, context}) => `${context.word}`
    },
    {
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.isSelf && context.subject == 'your',
      apply: ({context}) => `my ${context.word}`
    },
    { 
      where: where(),
      match: ({context, hierarchy}) => ['my', 'your'].includes(context.subject) && hierarchy.isA(context.marker, 'queryable') && context.paraphrase, 
      apply: ({g, context}) => `${context.subject} ${context.marker}`
    },
    /*
    { 
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'theAble') && context.paraphrase && context.wantsValue && !context.pullFromContext, 
      apply: ({g, context}) => `a ${context.word}`
    },
    */
    {
      where: where(),
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'queryable') && !context.isQuery && context.subject,
      apply: ({context}) => `${context.subject} ${context.word}`
    },
    { 
      where: where(),
      match: ({context}) => context.marker == 'unknown', 
      apply: ({context}) => {
        if (typeof context.marker === 'string' && context.value) {
          return context.value
        } else if (context.value) {
          return JSON.stringify(context.value)
        } else {
          return context.word
        }
      }
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
      apply: ({context, gp}) => {
        return `${gp({...context, topLevel: undefined})}?` 
      },
      priority: -1,
    },
    { 
      where: where(),
      notes: "x is y",
      match: ({context, hierarchy}) => { return hierarchy.isA(context.marker, 'is') && context.paraphrase },
      apply: ({context, g, gp}) => {
        return `${g({ ...context.one, paraphrase: true })} ${context.word} ${gp(context.two)}` 
      }
    },
    { 
      where: where(),
      notes: 'is with a response defined',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.evalue,
      apply: ({context, g}) => {
        const response = context.evalue;
        const concept = response.concept;
        if (concept) {
          concept.paraphrase = true
          concept.isSelf = true
          const instance = g(response.instance)
          return `${g(concept)} ${context.word} ${instance}` 
        } else {
          return `${g(response)}` 
        }
      }
    },
    { 
      where: where(),
      notes: 'x is y (not a response)',
      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && !context.evalue,
      apply: ({context, g, callId}) => {
        if ((context.two.evalue || {}).marker == 'answerNotKnown') {
          return g(context.two.evalue)
        }

        if (!context.isResponse) {
          return `${g({...context.one, paraphrase: true}, { assumed: {subphrase: true} })} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${g(context.two)}`
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
          return `${g(context.two)} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${g({...context.one, paraphrase: true}, { assumed: { subphrase: true } })}`
        } else {
          return `${g({...context.one, paraphrase: true}, { assumed: {subphrase: true} })} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${g(context.two)}`
        }
        // return `${g({...context.one})} ${isMany(context.one) || isMany(context.two) || isMany(context) ? "are" : "is"} ${g(context.two)}`
      },
    },
  ],

  semantics: [
    {
      where: where(),
      todo: 'debug23',
      match: ({context}) => context.marker == 'debug23',
      apply: ({context, hierarchy}) => {
        debugger
        debugger
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
      apply: ({context, gp}) => {
        context.evalue = "That is not known"
        if (context.reason) {
          context.evalue += ` because ${gp(context.reason)}`
        }
        context.isResponse = true
      }
    },
    { 
      where: where(),
      notes: 'pull from context',
      // match: ({context}) => context.marker == 'it' && context.pullFromContext, // && context.value,
      match: ({context}) => context.pullFromContext && !context.same, // && context.value,
      apply: ({context, s, kms, e, log, retry}) => {
        if (true) {
          /*
                   {
                      "marker": "unknown",
                      "range": {
                        "start": 65,
                        "end": 73
                      },
                      "word": "worth",
                      "text": "the worth",
                      "value": "worth",
                      "unknown": true,
                      "types": [
                        "unknown"
                      ],
                      "pullFromContext": true,
                      "concept": true,
                      "wantsValue": true,
                      "determiner": "the",
                      "modifiers": [
                        "determiner"
                      ],
                      "evaluate": true
                    }

          */
          context.value = kms.stm.api.mentions(context)
          if (!context.value) {
            // retry()
            context.value = { marker: 'answerNotKnown' }
            return
          }
          
          const instance = e(context.value)
          if (instance.evalue && !instance.edefault) {
            context.value = instance.evalue
          }
          if (context.evaluate) {
            context.evalue = context.value
          }
        } else {
          /*
                    {
                      "marker": "unknown",
                      "range": {
                        "start": 24,
                        "end": 32
                      },
                      "word": "price",
                      "text": "the price",
                      "value": "price",
                      "unknown": true,
                      "types": [
                        "unknown"
                      ],
                      "pullFromContext": true,
                      "concept": true,
                      "wantsValue": true,
                      "determiner": "the",
                      "modifiers": [
                        "determiner"
                      ],
                      "evaluate": true
                    }

          */
          context.value = kms.stm.api.mentions(context)
          // debugger;
          if (!context.value) {
            // retry()
            context.value = { marker: 'answerNotKnown' }
            return
          }
          // avoid loops
          if (context.marker != 'unknown') {
            if (context.value.marker != context.marker) {
              const instance = e(context.value)
              if (instance.evalue && !instance.edefault) {
                context.value = instance.evalue
              }
            }
          }
          if (context.evaluate) {
            context.evalue = context.value
          }
        }
      },
    },
    { 
      where: where(),
      notes: 'what x is y?',
      /*
        what type is object (what type is pikachu)   (the type is typeValue)
        what property is object (what color are greg's eyes)
        object is a type (is greg a human) // handled by queryBridge
      */

      match: ({context, hierarchy}) => hierarchy.isA(context.marker, 'is') && context.query,
      apply: ({context, s, log, km, objects, e}) => {
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
        let instance = e(value)
        if (false && instance.evalue) {
          km('stm').api.mentioned(value)
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
      apply: ({context, s, log, api, kms, config}) => {
        // const oneZero = { ...context.one }
        // const twoZero = { ...context.two }

        const one = context.one;
        const two = context.two;
        one.same = two;
        const onePrime = s(one)
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
          twoPrime = s(two)
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
					api.makeObject({ context: one, config, types: context.two.types || [] })
					kms.stm.api.setVariable(one.value, two)
					kms.stm.api.mentioned(one, two)
        }
      }
    },
    /*
    {
      where: where(),
      notes: 'x = y in the stm',
      match: ({context}) => context.marker == 'is' && !context.query && context.one && context.two,
      apply: ({context, s, log, api, kms, config}) => {
        const one = context.one;
        const two = context.two;
        api.makeObject({ context: one, config, types: context.two.types || [] })
        kms.stm.api.setVariable(one.value, two)
        kms.stm.api.mentioned(one, two)
      }
    },
    */
    {
      where: where(),
      notes: 'get variable from stm',
      match: ({context, kms}) => context.evaluate && kms.stm.api.getVariable(context.value) != context.value,
      // match: ({context, kms}) => context.evaluate,
      priority: -1,
      apply: ({context, kms, e}) => {
        const api = kms.stm.api
        context.value = api.getVariable(context.value)
        /*
        if (!context.value && context.marker !== 'unknown') {
          context.value = api.getVariable(context.marker)
        }
        */
        if (context.value && context.value.marker) {
          context.evalue = e(context.value)
        }
        context.focusableForPhrase = true
      }
    },
/*
    {
      where: where(),
      notes: 'default handle evaluate',
      match: ({context, kms}) => context.evaluate && context.value,
      // match: ({context, kms}) => context.evaluate,
      // priority: -1,
      apply: ({context, kms, e}) => {
        if (context.value && context.value.marker) {
          context.evalue = e(context.value)
        }
      }
    },
*/
    /*
    {
      priority: 2,
      notes: 'evaluate top level not already done',
      match: ({context}) => false && context.topLevel && !context.evalue,
      apply: ({context, e}) => {
        const instance = e({ ...context, value: undefined, topLevel: undefined })
        if (instance.evalue && !instance.edefault) {
          context.evalue = instance
          context.isResponse = true
        }
      }
    },
    */
  ],
};

const createConfig = () => {
  const config = new Config(configStruct, module)
  config.api = api
  config.add(gdefaults()).add(sdefaults()).add(pos()).add(stm()).add(meta()).add(punctuation())
  config.initializer( ({objects, config, isModule}) => {
    /* TODO add this beck in. some stuff from config needs to be here
    config.addArgs((args) => ({ 
      e: (context) => config.api.getEvaluator(args.s, args.log, context),
    }))
    */
    objects.mentioned = []
    objects.variables = {
    }
    if (isModule) {
    } else {
      config.addWord("canbedoquestion", { id: "canBeDoQuestion", "initial": "{}" })
      config.addWord("doesable", { id: "doesAble", "initial": "{}" })
    }
  })
  return config
}

knowledgeModule( { 
  module,
  description: 'framework for dialogues',
  createConfig, newWay: true,
  test: {
    name: './dialogues.test.json',
    contents: dialogues_tests
  },
})
