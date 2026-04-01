const { knowledgeModule, where, debug } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const helpers = require('./helpers')
const helpers_conjunction = require('./helpers/conjunction')
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

  remember(args) {
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
    concept.namespaced ??= {}
    concept.namespaced.stm ??= {}
    concept.namespaced.stm.id ??= this.getId()
    frameOfReference.mentioned = (frameOfReference.mentioned || []).filter( (context) => context.namespaced?.stm && context.namespaced.stm.id != concept.namespaced.stm.id )
    helpers.unshiftL(frameOfReference.mentioned, concept, this.maximumMentioned)
  }

  recall({ context, frameOfReference, useHierarchy=true, all, condition = (() => true), filter = ((result) => result) } = {}) {
    let mentioned = this._objects.mentioned
    let reversed = false
    if (frameOfReference) {
      if (frameOfReference.namespaced?.stm?.mentioned) {
        mentioned = [...frameOfReference[frameOfReference.namespaced.stm.mentioned]]
        if (frameOfReference.namespaced.stm.reversed) {
          mentioned.reverse()
          reversed = true
        }
      } else {
        if (typeof frameOfReference?.mentioned == 'string') {
          mentioned = frameOfReference[frameOfReference.mentioned]
        } else {
          mentioned = frameOfReference.mentioned
        }
      }
    }
    if (!mentioned) {
      return
    }
    const findPrevious = !!context.stm_previous
    const forAll = []
    function addForAll(context) {
      if (!forAll.find( (c) => c.namespaced.stm.id == context.namespaced.stm.id)) {
        if (reversed) {
          forAll.unshift(context)
        } else {
          forAll.push(context)
        }
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
        if (context.nameable_named && m.nameable_named) {
          continue
        }
        if (condition(m)) {
          if (all) {
            addForAll(m)
          } else {
            return filter(m)
          }
        }
      }
    }

    if (forAll.length > 0) {
      return filter(forAll)
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
        if (context.nameable_named && m.nameable_named) {
          continue
        }
        if (condition(m)) {
          if (all) {
            addForAll(m)
          } else {
            return filter(m)
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
            if (context.nameable_named && m.nameable_named) {
              continue
            }
            if (condition(m)) {
              if (all) {
                addForAll(m)
              } else {
                return filter(m)
              }
            }
          }
        }
      }
    }

    if (forAll.length > 0) {
      return filter(forAll)
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
              return filter(m)
            }
          }
        }
      }
    }

    if (forAll.length > 0) {
      return filter(forAll)
    }
  }

  getVariable(context) {
    if (!context || context.marker == 'mentions') {
      return
    }
    let valueNew = this.recall({ context, useHierarchy: false, condition: (context) => context.isVariable })
    if (valueNew && valueNew.value) {
      valueNew = valueNew.value
    }
    return valueNew
  }

  setVariable(variableName, value) {
    this.remember({ context: { marker: variableName, isVariable: true }, value })
  }
}

const api = new API()

const config = {
  name: 'stm',
  operators: [
    "(<stm_current|current> ([memorable]))",
    "(<stm_previous|previous> ([memorable]))",
    "(([memorable]) <stm_before|before>)",
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
        api.remember({ context: value })
      },
    },
    { 
      id: 'stm_previous',
      isA: ['adjective'],
      bridge: '{ ...after[0], modifiers: ["stm_previous"], stm_previous: operator, pullFromContext: true }',
    },  
    { 
      id: 'stm_current',
      isA: ['adjective'],
      bridge: '{ ...after[0], modifiers: ["stm_current"], stm_current: operator, pullFromContext: true }',
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
      match: ({context}) => context.marker == 'mentions' && context.evaluate,
      apply: ({context, kms, toList, resolveEvaluate}) => {
        resolveEvaluate(context, kms.stm.api.recall(context.args))
      }
    },
    { 
      where: where(),
      notes: 'pull from context',
      // match: ({context}) => context.marker == 'it' && context.pullFromContext, // && context.value,
      match: ({context, callId}) => context.pullFromContext && !context.same, // && context.value,
      apply: async ({callId, recall, toList, context, kms, e, log, retry}) => {
        context.value = (await recall({ context }))
        if (Array.isArray(context.value)) {
          context.value = toList(context.value)
        }

        if (!context.value) {
          // retry()
          context.evalue = { marker: 'answerNotKnown' }
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
  config.addArgs(({kms, e, toList}) => ({
    remember: (args) => {
      kms.stm.api.remember(args)
    },

    frameOfReference: (context, { mentioned, reversed } = {}) => {
      context.namespaced ??= {}
      context.namespaced.stm ??= {}
      if (mentioned !== null) {
        context.namespaced.stm.mentioned = mentioned // name of property that has the mentioned objects
      }
      if (reversed !== null) {
        context.namespaced.stm.reversed = reversed   // true iff the list is oldest first rather than newest first
      }
    },

    recall: async (args) => {
      if (args.frameOfReference?.nameable_named) {
        const result = await e(args.frameOfReference)
        if (result.evalue) {
          args.frameOfReference = result.evalue
        }
      }

      const result = await e({ marker: 'mentions', args })
      // evalue will return the argument if there is no evalue. dont want that for this case
      if (!result.evalue) {
        return
      }
      return helpers_conjunction.asList(helpers.toEValue(result), true)
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
             objects: [{ path: ['mentioned'] }],
             // objects: [defaultContextCheck({ extra: ['mentioned'] })],
             // objects: [{ property: 'mentioned', check: helpers.defaultContextCheckProperties }],
          },
  },
})
