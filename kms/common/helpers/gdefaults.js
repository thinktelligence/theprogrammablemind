const helpers = require('../helpers')

function interpolate(args) {
  return async (interpolate, context) => {
    async function evaluator(key) {
      if (Array.isArray(context[key])) {
        return args.gsp(context[key])
      } else {
        return args.gp(context[key])
      }
    }
    function getValue(keyOrValue) {
      if (typeof keyOrValue == 'string' && context[keyOrValue]) {
        return context[keyOrValue]
      }
      return keyOrValue // it's a value
    }

    if (Array.isArray(interpolate)) {
      const strings = []
      let separator = ''
      const byPosition = []
      for (const element of interpolate) {
        // { "word": { "marker": "canPassive" } ie { word: <selectionCriteria> }
        const handleElement = async (context, element) => {
          if (element.word) {
            const word = args.getWordFromDictionary(element.word)
            if (word) {
              strings.push(separator)
              strings.push(await args.gp(word))
              separator = ' '
            }
          } else if (typeof element == 'string') {
            separator = element
          } else if (element.separator && element.values) {
            let ctr = 0
            const values = getValue(element.values)
            const vstrings = []
            for (const value of values) {
              if (ctr == values.length-1) {
                vstrings.push(getValue(element.separator))
              }
              ctr += 1
              vstrings.push(getValue(value))
            }
            strings.push(await args.gsp(vstrings))
          } else if (element.semantic) {
            const wordContext = {}
            for (const term of element.semantic) {
              if (term.property) {
                Object.assign(wordContext, context[term.property])
              } else if (term.overrides) {
                Object.assign(wordContext, term.overrides)
              }
            }
            const value = await args.gp(wordContext) //, { options: { debug: { apply: true } } })
            if (value) {
              strings.push(separator)
              strings.push(await args.gp(value))
              separator = ' '
            }
          } else if (element.property) {
            value = context[element.property]
            if (value) {
              if (element.context) {
                value = { ...value, ...element.context }
              }
              async function handleProperty(value) {
                strings.push(separator)
                if (Array.isArray(value)) {
                  strings.push(await args.gsp(value))
                } else {
                  strings.push(await args.gp(value))
                }
                separator = ' '
              }
              if (element.byPosition) {
                const element = { start: value.range.start, insert: ((value) => () => handleProperty(value))(value) }
                if (byPosition.length == 0) {
                  byPosition.push(element)
                } else {
                  const index = byPosition.findIndex((element) => element.start < value.range.start)
                  if (index == -1) {
                    byPosition.unshift(element)
                  } else {
                    byPosition.splice(index+1, 0, element)
                  }
                }
              } else {
                await handleProperty(value)
              }
            }
          } else if (element.context) {
            let value = element.context
            if (element.property) {
              value = context[element.property]
              if (element.context) {
                Object.assign(value, element.context)
              }
            }
            if (value?.form !== 'infinitive' && element.number) {
              value.number = isMany(context[element.number]) ? "many": "one"
            }
            if (value) {
              strings.push(separator)
              strings.push(await args.gp(value))
              separator = ' '
            }
          }
        }

        let currentContext = context
        let currentElement = element
        while (currentElement.inside) {
          currentContext = currentContext[currentElement.inside]
          currentElement = currentElement.value
        }
        await handleElement(currentContext, currentElement)
      }
      for (const { insert } of byPosition) {
        await insert()
      }
      return strings.join('')
    } else {
      return await helpers.processTemplateString(interpolate, evaluator)
    }
  }
}

module.exports = {
  interpolate
}
