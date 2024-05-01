const pluralize = require('pluralize')
const deepEqual = require('deep-equal')
const { chooseNumber } = require('../helpers.js')
const { compose, translationMapping, translationMappingToInstantiatorMappings } = require('./meta.js')

class API {
  initialize() {
    this.objects.valueToWords = []
    this.objects.defaultTypesForHierarchy = new Set([])
  }

  addDefaultTypesForObjectHierarchy(types) {
    for (let type of types) {
      this.objects.defaultTypesForHierarchy.add(type)
    }
  }

  setupObjectHierarchy(config, id, { include_concept=true  } = {}) {
    const types = [...this.objects.defaultTypesForHierarchy]

    if (include_concept) {
      types.push('concept');
    }
  
    for (let type of types) {
      config.addHierarchy(id, type)
    }
  }

  // for example, "crew member" or "photon torpedo"
  // TODO account for modifier a complex phrase for example "hot (chicken strips)"
  kindOfConcept({ config, modifier, object }) {
    const objectId = pluralize.singular(object)
    const modifierId = pluralize.singular(modifier)
    const modifierObjectId = `${modifierId}_${objectId}`

    const objectSingular = pluralize.singular(object)
    const objectPlural = pluralize.plural(object)
    config.addOperator({ pattern: `((${modifierId}/0) [${modifierObjectId}] (${objectId}/0))`, allowDups: true })
    // config.addOperator({ pattern: `(<${modifierId}|> ([${objectId}|]))`, allowDups: true })
    // config.addOperator({ pattern: `([${modifierObjectId}|])`, allowDups: true })
    config.addOperator({ pattern: `([${modifierId}|])`, allowDups: true })
    config.addOperator({ pattern: `([${objectId}|])`, allowDups: true })

    config.addWord(objectSingular, { id: objectId, initial: `{ value: '${objectId}', number: 'one' }`})
    config.addWord(objectPlural, { id: objectId, initial: `{ value: '${objectId}', number: 'many' }`})
    config.addWord(modifierId, { id: modifierId, initial: `{ value: '${modifierId}' }`})

    // config.addBridge({ id: modifierId, level: 0, bridge: `{ ...after, ${modifierId}: operator, marker: operator(concat('${modifierId}_', after.value)), atomic: true, value: concat('${modifierId}_', after.value), modifiers: append(['${modifierId}'], after[0].modifiers)}`, allowDups: true })
    config.addBridge({ id: modifierId, level: 0, bridge: `{ ...next(operator), value: '${modifierId}' }`,  allowDups: true })
    config.addBridge({ id: objectId, level: 0, bridge: `{ ...next(operator), value: '${objectId}' }`,  allowDups: true })
    // config.addBridge({ id: modifierObjectId, level: 0, bridge: `{ ...next(operator), value: '${modifierObjectId}' }`, allowDups: true })
    config.addBridge({ 
      id: modifierObjectId, 
      level: 0, 
      convolution: true,
      isA: ['adjective'],
      before: ['verby'],
      // bridge: `{ ...after[0], ${modifierId}: before[0], atomic: true, dead: true, marker: operator(concat(before.value, '_', after.value)), value: concat(before.value, '_', after.value), modifiers: append(['${modifierId}'], after[0].modifiers)}`, 
      bridge: `{ ...after[0], ${modifierId}: before[0], atomic: true, dead: true, marker: next(operator(concat(before.value, '_', after.value))), value: concat(before.value, '_', after.value), modifiers: append(['${modifierId}'], after[0].modifiers)}`, 
      // bridge: `{ ...after[0], ${modifierId}: before[0], atomic: true, value: concat(before.value, after.value), modifiers: append(['${modifierId}'], after[0].modifiers)}`, 
    // config.addBridge({ id: modifierId, level: 0, bridge: `{ ...after, ${modifierId}: operator, marker: operator(concat('${modifierId}_', after.value)), atomic: true, value: concat('${modifierId}_', after.value), modifiers: append(['${modifierId}'], after[0].modifiers)}`, allowDups: true })
      allowDups: true })
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
    if (config.getBridge('hierarchyAble')) {
      config.addHierarchy(objectId, 'hierarchyAble')
      config.addHierarchy(modifierObjectId, 'hierarchyAble')
    }

    config.addPriorities([['articlePOS', 0], [modifierId, 0]])
    config.addPriorities([['articlePOS', 0], [objectId, 0]])
    config.addPriorities([[modifierId, 0], [modifierObjectId, 0]])
    config.addPriorities([[objectId, 0], [modifierObjectId, 0]])
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
      context = { marker: value, value: value, number, word: value, paraphrase: true }
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
}

module.exports = {
  API
}
