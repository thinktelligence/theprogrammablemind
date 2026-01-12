const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const helpers = require('./helpers')
const articles = require('./articles')
const evaluate = require('./evaluate')
const stm_tests = require('./stm.test.json')

class API {
  initialize({ objects }) {
    this._objects = objects
    this.isAs = [
      (child, parent) => child == parent
    ]
    this._objects.mentioned = []
    this._objects.variables = {}
    this.idCounter = 0
    this.maximumMentioned = 50
  }

  getId() {
    return ++this.idCounter
  }

  addIsA(isA) {
    if (!this.isAs.find( (f) => f == isA )) {
      this.isAs.push(isA)
    }
  }

  isA(child, parent) {
    for (const isA of this.isAs) {
      if (isA(child, parent)) {
        return true
      }
    }
    return false
  }

  getByType(type) {
    return this._objects.mentioned.filter( (context) => this.isA(context.marker, type) )
  }

  mentioned(args) {
    let concept, value, frameOfReference
    if (!args.context) {
      concept = args
    } else {
      concept = args.context
      value = args.value
      frameOfReference = args.frameOfReference
    }

    if (!frameOfReference) {
      frameOfReference = this._objects
    }
    // TODO value should perhaps have been called id as in concept id and then value could be value
    if (value) {
      concept = { ...concept, pullFromContext: false }
    } else {
      concept.pullFromContext = false
    }
    if (value) {
      if (concept.marker == 'unknown') {
        if (concept.value) {
          concept.marker = concept.value
        }
      }
      concept.value = value
    }
    concept.fromSTM = true
    if (!concept.stm) {
      concept.stm = {}
    }
    if (!concept.stm.id) {
      concept.stm.id = this.getId()
    }
    frameOfReference.mentioned = (frameOfReference.mentioned || []).filter( (context) => context.stm && context.stm.id != concept.stm.id )
    helpers.unshiftL(frameOfReference.mentioned, concept, this.maximumMentioned)
  }

  mentions({ context, frameOfReference, useHierarchy=true, all, condition = (() => true) } = {}) {
    const mentioned = frameOfReference?.mentioned || this._objects.mentioned

    const findPrevious = !!context.stm_previous
    const forAll = []
    function addForAll(context) {
      if (!forAll.find( (c) => c.stm.id == context.stm.id)) {
        forAll.push(context)
      }
    }

    // care about value first
    let findCounter = 0
    for (const m of mentioned) {
      if (context.value && (context.value == m.marker || context.value == m.value)) {
        findCounter += 1
        if (findPrevious && findCounter < 2) {
          continue
        }
        if (condition()) {
          if (all) {
            allForAll(m)
          } else {
            return m
          }
        }
      }
    }

    if (!useHierarchy) {
      return
    }

    // care about marker second
    findCounter = 0
    for (const m of mentioned) {
      if (context.marker != 'unknown' && this.isA(m.marker, context.marker)) {
        findCounter += 1
        if (findPrevious && findCounter < 2) {
          continue
        }
        if (condition(m)) {
          if (all) {
            addForAll(m)
          } else {
            return m
          }
        }
      }
      // if (context.types && context.types.includes(m.marker)) {
      if (context.types) {
        for (const parent of context.types) {
          if (parent != 'unknown' && this.isA(m.marker, parent)) {
            findCounter += 1
            if (findPrevious && findCounter < 2) {
              continue
            }
            if (condition(m)) {
              if (all) {
                addForAll(m)
              } else {
                return m
              }
            }
          }
        }
      }
    }

    findCounter = 0
    if (context.types && context.types.length == 1) {
      for (const m of mentioned) {
        if (context.unknown) {
          findCounter += 1
          if (findPrevious && findCounter < 2) {
            continue
          }
          if (condition(m)) {
            if (all) {
              addForAll(m)
            } else {
              return m
            }
          }
        }
      }
    }

    if (all) {
      return forAll
    }
  }

  getVariable(name) {
    if (!name) {
      return
    }
    let valueNew = this.mentions({ context: { marker: name, value: name }, useHierarchy: false }) || name
    if (valueNew && valueNew.value) {
      valueNew = valueNew.value
    }
    return valueNew
  }

  setVariable(name, value) {
    this.mentioned({ context: { marker: name }, value })
  }
}

const api = new API()

const config = {
  name: 'stm',
  operators: [
    "([stm_previous|previous] ([memorable]))",
    "(([memorable]) [stm_before|before])",
    "([remember] (memorable/*))",
  ],
  words: {
    literals: {
      "m1": [{"id": "memorable", scope: "testing", "initial": "{ value: 'm1' }" }],
      "m2": [{"id": "memorable", scope: "testing", "initial": "{ value: 'm2' }" }],
    },
  },
  bridges: [
    { 
      id: 'memorable', 
      isA: ['theAble'],
      words: helpers.words('memorable') 
    },
    { 
      id: 'remember', 
      bridge: "{ ...next(operator), postModifiers: ['rememberee'], rememberee: after[0] }",
      isA: ['verb'],
      semantic: async ({context, api, e}) => {
        let value = (await e(context.rememberee)).evalue
        if (value == context.rememberee.value) {
          value = context.rememberee
        }
        api.mentioned({ context: value })
      },
    },
    { 
      id: 'stm_previous',
      bridge: '{ ...after[0], modifiers: ["stm_previous"], stm_previous: operator, pullFromContext: true }',
    },  
    { 
      id: 'stm_before',
      isA: ['adjective'],
      bridge: '{ ...before[0], postModifiers: ["stm_previous"], stm_previous: operator, pullFromContext: true }',
    },  
  ],
  semantics: [
    { 
      where: where(),
      notes: 'pull from context',
      // match: ({context}) => context.marker == 'it' && context.pullFromContext, // && context.value,
      match: ({context, callId}) => context.pullFromContext && !context.same, // && context.value,
      apply: async ({callId, context, kms, e, log, retry}) => {
        context.value = kms.stm.api.mentions({ context })
        if (!context.value) {
          // retry()
          context.value = { marker: 'answerNotKnown' }
          return
        }
        
        const instance = await e(context.value)
        if (instance.evalue && !instance.edefault) {
          context.value = instance.evalue
        }
        if (context.evaluate) {
          context.evalue = context.value
        }
      },
    },
  ],
}

function initializer({config}) {
    config.addArgs(({kms}) => ({
      mentioned: (args) => {
        kms.stm.api.mentioned(args)
      },
      mentions: (args) => {
        return kms.stm.api.mentions(args)
      },
    }))
  }

knowledgeModule( { 
  config,
  api: () => new API(),
  includes: [evaluate, articles],
  initializer,

  module,
  description: 'short term memory',
  test: {
    name: './stm.test.json',
    contents: stm_tests,
    checks: {
             context: [defaultContextCheck({ extra: ['pullFromContext', 'stm_id'] })],
             objects: [defaultContextCheck({ extra: ['mentioned'] })],
             // objects: [{ property: 'mentioned', filter: helpers.defaultContextCheckProperties }],
          },
  },
})
