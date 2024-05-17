const pluralize = require('pluralize')
const deepEqual = require('deep-equal')
const { chooseNumber } = require('../helpers.js')
const { compose, translationMapping, translationMappingToInstantiatorMappings } = require('./meta.js')

class API {
  initialize({ objects }) {
    this._objects = objects
    this._objects.valueToWords = []
    this._objects.defaultTypesForHierarchy = new Set([])
  }

  addDefaultTypesForObjectHierarchy(types) {
    for (let type of types) {
      this._objects.defaultTypesForHierarchy.add(type)
    }
  }

  setupObjectHierarchy(config, id, { include_concept=true  } = {}) {
    const types = [...this._objects.defaultTypesForHierarchy]

    if (include_concept) {
      types.push('concept');
    }
  
    for (let type of types) {
      config.addHierarchy(id, type)
    }
  }

  // for example, "crew member" or "photon torpedo"
  // TODO account for modifier a complex phrase for example "hot (chicken strips)"
  kindOfConcept({ config, modifiers, object }) {
    const objectId = pluralize.singular(object)
    const modifierIds = modifiers.map( (modifier) => pluralize.singular(modifier) )
    const modifiersObjectId = `${modifierIds.join("_")}_${objectId}`

    const objectSingular = pluralize.singular(object)
    const objectPlural = pluralize.plural(object)
    config.addOperator({ pattern: `(${modifierIds.map((modifierId) => `(${modifierId}/0)`).join(' ')} [${modifiersObjectId}] (${objectId}/0))`, allowDups: true })
    // config.addOperator({ pattern: `(<${modifierId}|> ([${objectId}|]))`, allowDups: true })
    // config.addOperator({ pattern: `([${modifierObjectId}|])`, allowDups: true })
    modifierIds.forEach((modifierId) => config.addOperator({ pattern: `([${modifierId}|])`, allowDups: true }))
    config.addOperator({ pattern: `([${objectId}|])`, allowDups: true })

    config.addWord(objectSingular, { id: objectId, initial: `{ value: '${objectId}', number: 'one' }`})
    config.addWord(objectPlural, { id: objectId, initial: `{ value: '${objectId}', number: 'many' }`})
    modifierIds.forEach((modifierId) => config.addWord(modifierId, { id: modifierId, initial: `{ value: '${modifierId}' }`}))

    modifierIds.forEach((modifierId) => config.addBridge({ id: modifierId, level: 0, bridge: `{ ...next(operator), value: '${modifierId}' }`,  allowDups: true }))
    config.addBridge({ id: objectId, level: 0, bridge: `{ ...next(operator), value: '${objectId}' }`,  allowDups: true })
    // config.addBridge({ id: modifierObjectId, level: 0, bridge: `{ ...next(operator), value: '${modifierObjectId}' }`, allowDups: true })
    const modifierProperties = modifierIds.map((modifierId, index) => `'${modifierId}': before[${index}]`).join(', ')
    const modifierList = modifierIds.map((modifierId) => `'${modifierId}'`).join(', ')

    config.addBridge({ 
      id: modifiersObjectId, 
      level: 0, 
      convolution: true,
      isA: ['adjective'],
      before: ['verby'],
      // bridge: `{ ...after[0], ${modifierProperties}, atomic: true, dead: true, marker: next(operator(concat(before.value, '_', after.value))), value: concat(before.value, '_', after.value), modifiers: append([${modifierList}], after[0].modifiers)}`, 
      bridge: `{ ...after[0], ${modifierProperties}, atomic: true, dead: true, marker: next(operator('${modifiersObjectId}')), value: '${modifiersObjectId}', modifiers: append([${modifierList}], after[0].modifiers)}`, 
      allowDups: true })
    {
      const word = {
        "marker": modifiersObjectId,
        "modifiers": modifierIds,
        "types": [
          modifiersObjectId,
        ],
        "value": modifiersObjectId,
        "word": objectId,
      }
      modifierIds.forEach((modifierId) => {
        word[modifierId] = {
          "marker": modifierId,
          "value": modifierId,
          "word": modifierId, 
        }
      })
      this.addWord(word)
    }
    this.setupObjectHierarchy(config, objectId);
    modifierIds.forEach((modifierId) => this.setupObjectHierarchy(config, modifierId, { include_concept: false }))
    this.setupObjectHierarchy(config, modifiersObjectId);
    if (config.getBridge('hierarchyAble')) {
      config.addHierarchy(objectId, 'hierarchyAble')
      config.addHierarchy(modifiersObjectId, 'hierarchyAble')
    }

    modifierIds.forEach((modifierId) => config.addPriorities([['articlePOS', 0], [modifierId, 0]]))
    config.addPriorities([['articlePOS', 0], [objectId, 0]])
    modifierIds.forEach((modifierId) => config.addPriorities([[modifierId, 0], [modifiersObjectId, 0]]))
    config.addPriorities([[objectId, 0], [modifiersObjectId, 0]])
  }

  addWord(context) {
    if (!context || !context.value || !context.word) {
      return
    }
    this.addWordToValue(context.value, context)
  }

  addWordToValue(value, word) {
    if (!this._objects.valueToWords[value]) {
      this._objects.valueToWords[value] = []
    }

    word = Object.assign({}, word)
    delete word.evalue
    word.paraphrase = true

    if (this._objects.valueToWords[value].some( (entry) => deepEqual(entry, word) )) {
      return
    }

    const words = this._objects.valueToWords[value]
    if (!words.includes(word)) {
      words.push(word)
    }
  }

  getWordForValue(value, { number } = {}) {
    let context;
    if (!this._objects.valueToWords[value]) {
      context = { marker: value, value: value, number, word: value, paraphrase: true }
    } else {
      context = this._objects.valueToWords[value][0]
    }
    if (context.word) {
      context.word = (number == 'many') ? pluralize.plural(context.word) : pluralize.singular(context.word)
    }
    return context
  }

  getWordsForValue(value) {
    return this._objects.valueToWords[value]
  }
}

module.exports = {
  API
}
