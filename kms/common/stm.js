const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const stm_tests = require('./stm.test.json')

class API {
  initialize({ objects }) {
    this._objects = objects
    this.isAs = [
      (child, parent) => child == parent
    ]
    this._objects.mentioned = []
    this._objects.variables = {}
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

  mentioned(concept, value = undefined) {
    concept = { ...concept, pullFromContext: false }
    if (value) {
      if (concept.marker == 'unknown') {
        if (concept.value) {
          concept.marker = concept.value
        }
      }
      concept.value = value
    }
    this._objects.mentioned.unshift(concept)
  }

  mentions(context, useHierarchy=true) {
    // care about value first
    for (let m of this._objects.mentioned) {
      if (context.value && context.value == m.marker) {
        return { ...m, fromSTM: true }
      }
    }

    if (!useHierarchy) {
      return
    }
    // care about marker second
    for (let m of this._objects.mentioned) {
      if (context.marker != 'unknown' && this.isA(m.marker, context.marker)) {
        return { ...m, fromSTM: true }
      }
      // if (context.types && context.types.includes(m.marker)) {
      if (context.types) {
        for (let parent of context.types) {
          if (parent != 'unknown' && this.isA(m.marker, parent)) {
            return { ...m, fromSTM: true }
          }
        }
      }
    }
    if (context.types && context.types.length == 1) {
      for (let m of this._objects.mentioned) {
        if (context.unknown) {
          return { ...m, fromSTM: true }
        }
      }
    }
  }

  getVariable(name) {
    if (!name) {
      return
    }
    let valueNew = this.mentions({ marker: name, value: name }, false) || name
    if (valueNew && valueNew.value) {
      valueNew = valueNew.value
    }
    return valueNew
  }

  setVariable(name, value) {
    this.mentioned({ marker: name }, value)
  }
}

const api = new API()

let createConfig = () => {
  const config = new Config({ name: 'stm' }, module)
  config.stop_auto_rebuild()

  config.initializer( ({config}) => {
    config.addArgs(({kms}) => ({
      mentioned: (context) => {
        kms.stm.api.mentioned(context)
      },
    }))
  })
  config.api = api

  config.restart_auto_rebuild()
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
            context: defaultContextCheck,
          },
  },
})
