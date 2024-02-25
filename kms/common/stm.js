const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const stm_tests = require('./stm.test.json')

class API {
  initialize() {
    this.isAs = [
      (child, parent) => child == parent
    ]
    this.objects.mentioned = []
    this.objects.variables = {}
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
    this.objects.mentioned.unshift(concept)
  }

  mentions(context) {
    // care about value first
    for (let m of this.objects.mentioned) {
      if (context.value && context.value == m.marker) {
        return m
      }
    }
    // care about marker second
    for (let m of this.objects.mentioned) {
      if (context.marker != 'unknown' && this.isA(m.marker, context.marker)) {
        return m
      }
      // if (context.types && context.types.includes(m.marker)) {
      if (context.types) {
        for (let parent of context.types) {
          if (parent != 'unknown' && this.isA(m.marker, parent)) {
            return m
          }
        }
      }
    }
    if (context.types && context.types.length == 1) {
      for (let m of this.objects.mentioned) {
        if (context.unknown) {
          return m
        }
      }
    }
  }

  getVariable(name) {
    if (!name) {
      return
    }
    let valueNew = this.mentions({ marker: name, value: name }) || name
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

let config = new Config({ name: 'stm' }, module)
config.api = api

config.initializer( ({objects, config, api, isModule}) => {
})

knowledgeModule( { 
  module,
  description: 'short term memory',
  config,
  test: {
    name: './stm.test.json',
    contents: stm_tests
  },
})
