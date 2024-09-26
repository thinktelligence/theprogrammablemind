const pluralize = require('pluralize')
const deepEqual = require('deep-equal')
const { chooseNumber, zip } = require('../helpers.js')
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
    // TODO make the modifiers objects then below for add words for modifiers only do if !unknown
    // const objectId = pluralize.singular(object)
    const objectId = this.args.kms.dialogues.api.toScopedId(object)
    // const modifierIds = modifiers.map( (modifier) => pluralize.singular(modifier) )
    const modifierIds = modifiers.map( (modifier) => this.args.kms.dialogues.api.toScopedId(modifier) )
    const modifiersObjectId = `${modifierIds.join("_")}_${objectId}`

    const toWord = (object) => {
      if (typeof object == 'string') {
        return object
      }
      return object.text
    }
    const objectWord = toWord(object)
    // const objectWord = object
    // TODO call evaluator to pick up overrides
    const objectSingular = pluralize.singular(objectWord)
    const objectPlural = pluralize.plural(objectWord)
    // config.addOperator({ pattern: `(${modifierIds.map((modifierId) => `(${modifierId}/*)`).join(' ')} [${modifiersObjectId}] (${objectId}/0))`, allowDups: true })
    config.addOperator({ pattern: `(${modifierIds.map((modifierId) => `(${modifierId}/*)`).join(' ')} [${modifiersObjectId}] (${objectId}/*))`, allowDups: true })
    // config.addOperator({ pattern: `(<${modifierId}|> ([${objectId}|]))`, allowDups: true })
    // config.addOperator({ pattern: `([${modifierObjectId}|])`, allowDups: true })

    const objectModifierConcept = `${objectId}_modifier`
    if (!config.exists(objectModifierConcept)) {
      config.addOperator({ pattern: `([${objectModifierConcept}|])`, allowDups: true })
      config.addBridge({ id: objectModifierConcept, bridge: `{ ...next(operator) }`,  allowDups: true })
    }

    modifierIds.forEach((modifierId) => {
      if (!config.exists(modifierId)) {
        config.addOperator({ pattern: `([${modifierId}|])`, allowDups: true })
      }
      config.addHierarchy(modifierId, objectModifierConcept)
    })
    if (!config.exists(objectId)) {
      config.addOperator({ pattern: `([${objectId}|])`, allowDups: true })
    }

    if (object.unknown) {
      config.addWord(objectSingular, { id: objectId, initial: `{ value: '${objectId}', number: 'one' }`})
      config.addWord(objectPlural, { id: objectId, initial: `{ value: '${objectId}', number: 'many' }`})
    }

    zip(modifiers, modifierIds).forEach(([modifier, modifierId]) => {
      // config.addWord(modifier, { id: modifierId, initial: `{ value: '${modifierId}' }`})
      // TODO call evaluator to pick up overrides
      if (modifier.unknown) {
        const modifierWord = modifier.text
        config.addWord(pluralize.singular(modifierWord), { id: modifierId, initial: `{ value: '${modifierId}', number: 'one' }`})
        config.addWord(pluralize.plural(modifierWord), { id: modifierId, initial: `{ value: '${modifierId}', number: 'many' }`})
      }
    })
    // modifierds.forEach((modifierId) => config.addWord(modifierId, { id: modifierId, initial: `{ value: '${modifierId}' }`}))

    modifierIds.forEach((modifierId) => config.addBridge({ id: modifierId, level: 0, bridge: `{ ...next(operator), value: '${modifierId}' }`,  allowDups: true }))
    config.addBridge({ id: objectId, level: 0, bridge: `{ ...next(operator), value: '${objectId}' }`,  allowDups: true })
    // config.addBridge({ id: modifierObjectId, level: 0, bridge: `{ ...next(operator), value: '${modifierObjectId}' }`, allowDups: true })
    const modifierProperties = modifierIds.map((modifierId, index) => `'modifier_${modifierId}': before[${index}]`).join(', ')
    const modifierList = modifierIds.map((modifierId) => `'modifier_${modifierId}'`).join(', ')

    config.addBridge({ 
      id: modifiersObjectId, 
      level: 0, 
      convolution: true,
      isA: [{ parent: 'adjective', instance: true }],
      // isA: ['adjective'],
      before: ['verb'],
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
    config.addHierarchy(modifiersObjectId, objectId)

    modifierIds.forEach((modifierId) => config.addPriority({ "context": [[modifierId, 0], ['articlePOS', 0]], "choose": [0] }))
    config.addPriority({ "context": [[objectId, 0], ['articlePOS', 0], ], "choose": [0] })
    // maybe remove the next line
    modifierIds.forEach((modifierId) => config.addPriority({ context: [[modifiersObjectId, 0], [modifierId, 0], ], generalize: false, choose: [0] }))
    config.addPriority({ "context": [[modifiersObjectId, 0], [objectId, 0], ], choose: [0] })
    config.addPriority({ context: [['list', 0]].concat(modifierIds.map((id) => [id, 0])).concat([[objectId, 0]]), ordered: true, choose: [1,2] })
    if (config.exists('number')) {
      // config.addPriority({ context: [['list', 0], ['number', 0]].concat(modifierIds.map((id) => [id, 0])).concat([[objectId, 0]]), ordered: true, choose: [2,3] })
      if (modifierIds.length > 1) {
        let choose = []
        for (let i = 0; i < modifierIds.length; ++i) {
          choose.push(i+2)
        }
        config.addPriority({ context: [['list', 0], ['number', 0]].concat(modifierIds.map((id) => [id, 0])).concat([[objectId, 0]]), ordered: true, choose })
      }
      config.addPriority({ context: [['list', 0], ['number', 1], [modifiersObjectId, 1]], ordered: true, choose: [1,2] })
    }
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
