const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
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
    for (let isA of this.isAs) {
      if (isA(child, parent)) {
        return true
      }
    }
    return false
  }

  getByType(type) {
    return this._objects.mentioned.filter( (context) => this.isA(context.marker, type) )
  }

  mentioned({ context:concept, value=null } = {}) {
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
    this._objects.mentioned = this._objects.mentioned.filter( (context) => context.stm && context.stm.id != concept.stm.id )
    this._objects.mentioned.unshift(concept)
  }

  mentions({ context, useHierarchy=true } = {}) {
    const findPrevious = !!context.stm_previous

    // care about value first
    let findCounter = 0
    for (let m of this._objects.mentioned) {
      if (context.value && (context.value == m.marker || context.value == m.value)) {
        if (findPrevious && findCounter < 1) {
          findCounter += 1
          continue
        }
        return m
      }
    }

    if (!useHierarchy) {
      return
    }

    // care about marker second
    findCounter = 0
    for (let m of this._objects.mentioned) {
      if (context.marker != 'unknown' && this.isA(m.marker, context.marker)) {
        if (findPrevious && findCounter < 1) {
          findCounter += 1
          continue
        }
        return m
      }
      // if (context.types && context.types.includes(m.marker)) {
      if (context.types) {
        for (let parent of context.types) {
          if (parent != 'unknown' && this.isA(m.marker, parent)) {
            if (findPrevious && findCounter < 1) {
              findCounter += 1
              continue
            }
            return m
          }
        }
      }
    }

    findCounter = 0
    if (context.types && context.types.length == 1) {
      for (let m of this._objects.mentioned) {
        if (context.unknown) {
          if (findPrevious && findCounter < 1) {
            findCounter += 1
            continue
          }
          return m
        }
      }
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

const configStruct = {
  name: 'stm',
  operators: [
    "([stm_previous|previous] ([memorable]))",
    "(([memorable]) [stm_before|before])",
    "([remember] (memorable/*))",
  ],
  words: {
    literals: {
      "m1": [{"id": "memorable", development: true, "initial": "{ value: 'm1' }" }],
      "m2": [{"id": "memorable", development: true, "initial": "{ value: 'm2' }" }],
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
      isA: ['verby'],
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

let createConfig = async () => {
  const config = new Config(configStruct, module)
  config.stop_auto_rebuild()

  await config.initializer( ({config}) => {
    config.addArgs(({kms}) => ({
      mentioned: ({ context }) => {
        kms.stm.api.mentioned({ context })
      },
      mentions: ({ context }) => {
        return kms.stm.api.mentions({ context })
      },
    }))
  })
  await config.setApi(api)
  await config.add(evaluate, articles)

  await config.restart_auto_rebuild()
  return config
}

knowledgeModule( { 
  module,
  description: 'short term memory',
  createConfig,
  test: {
    name: './stm.test.json',
    contents: stm_tests,
    checks: {
            context: [...defaultContextCheck, 'pullFromContext', 'stm_id'],
            objects: ['mentioned'],
          },
  },
})
