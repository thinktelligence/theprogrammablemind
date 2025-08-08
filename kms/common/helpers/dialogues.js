const pluralize = require('pluralize')
const { indent, focus } = require('../helpers')

class API {
  initialize({ objects }) {
    this._objects = objects
    this._objects.idSuffix = ''
  }

  setIdSuffix(idSuffix) {
    this._objects.idSuffix = idSuffix
  }

  toScopedId(context) {
    if (typeof context == 'string') {
      return pluralize.singular(context) + this._objects.idSuffix
    } else {
      const { unknown, value, word, raw_text } = context;
      // return unknown ? pluralize.singular(word) + this._objects.idSuffix : pluralize.singular(value || word)
      return unknown ? pluralize.singular(raw_text || word) + this._objects.idSuffix : value || pluralize.singular(word)
      /*
      if (raw_text && raw_text !== word) {
        debugger
      }
      */
      //return unknown ? pluralize.singular(word) + this._objects.idSuffix : value || pluralize.singular(word)
    }
  }

  warningNotEvaluated(log, value) {
    const description = 'WARNING from Dialogues KM: For semantics, implement an evaluations handler, set "value" property of the operator to the value.'
    const match = `({context}) => context.marker == '${value.marker}' && context.evaluate && <other conditions as you like>`
    const apply = `({context}) => <do stuff...>; context.value = <value>`
    const input = indent(JSON.stringify(value, null, 2), 2)
    const message = `${description}\nThe semantic would be\n  match: ${match}\n  apply: ${apply}\nThe input context would be:\n${input}\n`
    log(indent(message, 4))
  }

  //
  // duck typing: for operators you want to use here
  //
  //   1. Use hierarchy to make them an instance of queryable. For example add hierarchy entry [<myClassId>, 'queryable']
  //   2. For semantics, if evaluate == true then set the 'value' property of the operator to the value.
  //   3. Generators will get contexts with 'response: true' set. Used for converting 'your' to 'my' to phrases like 'your car' or 'the car'.
  //   4. Generators will get contexts with 'instance: true' and value set. For converting values like a date to a string.
  //

  // used with context sensitive words like 'it', 'that' etc. for example if you have a sentence "create a tank"
  // then call mentioned with the tank created. Then if one asks 'what is it' the 'it' will be found to be the tank.

  setBrief(value) {
    this._objects.brief = value
  }

  getBrief() {
    return this._objects.brief
  }

  async evaluateToConcept(value, context, log, s) {
    value.evaluate = { toConcept: true }
    const concept = await s(value)
    if (!concept.evalue && !concept.verbatim) {
      this.warningNotEvaluated(log, value);
      concept.evalue = concept.value
    }
    delete concept.evaluate
    return concept
  }

  setupObjectHierarchy(config, id, { types } = {}) {
    for (let type of types) {
      if (typeof type !== 'string') {
        type = type.word
      }
      config.addHierarchy(id, type)
    }
  }

  // word is for one or many
  makeObject({config, context, types=[], source_value=undefined, doPluralize=true} = {}) {
    if (typeof context == 'string') {
      context = { word: context, value: context }
    }
    const { word, value, number } = context;
    if (!value) {
      return
    }
    // const concept = pluralize.singular(value)
    const concept = this.toScopedId(context)
    if (config.exists(concept)) {
      return concept
    }

    // TODO handle the general case
    const fixUps = (concept) => {
      if (concept == '*') {
        return '\\*'
      }
      return concept
    }
    // config.addOperator({ pattern: `(["${fixUps(concept)}"])`, allowDups: true })
    config.addOperator({ pattern: `(["${concept}"])`, allowDups: true })
    config.addBridge({ id: concept, level: 0, bridge: `{ ...next(operator), value: or(operator.value, '${source_value || concept}') }` , allowDups: true })
    const addConcept = (word, number) => {
      config.addWord(word, { id: concept, initial: `{ value: "${source_value || concept}", number: "${number}" }` } )
      const baseTypes = [
        'theAble',
        'queryable',
        'isEdee',
        'isEder',
      ];

      const allTypes = new Set(baseTypes.concat(types))
      this.setupObjectHierarchy(config, concept, {types: allTypes});
    }

    pluralize.isSingular(word)
    if (pluralize.isSingular(word)) {
      addConcept(word, 'one')
      doPluralize && addConcept(pluralize.plural(word), 'many')
    } else {
      doPluralize && addConcept(pluralize.singular(word), 'one')
      addConcept(word, 'many')
    }

    // mark greg as an instance?
    // add a generator for the other one what will ask what is the plural or singluar of known
    /*
    if (number == 'many') {
    } else if (number == 'one') {
    }
    */
    return concept;
  }
}

module.exports = {
  API
}
