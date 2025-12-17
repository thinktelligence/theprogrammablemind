// declensions.test.js
const helpers = require('./helpers')
const canKM = require('./can')

describe('can km', () => {
  let km 

  beforeEach( async () => {
    km = await canKM({ useCache: false })
  })

  test('NEOS23 active to passive', async () => {
    await km.run(async ({fragments, s, gp, addWordToDictionary, getWordFromDictionary, config}) => {
      const fragment = await fragments("cansubject can canverb canobject")
      const context = fragment.contexts()[0]
      console.log(JSON.stringify(context, null, 2))
      const contextPrime = await s({ ...context, toVoice: 'passive', flatten: false })
      const text = await gp(contextPrime)
      console.log(JSON.stringify(contextPrime.interpolate, null, 2))
      console.log(text)
      const expected = 'canobject can be canverbed by cansubject'
      expect(text).toBe(expected)
    })
  })

  test('NEOS23 passive to active', async () => {
    await km.run(async ({fragments, s, gp, addWordToDictionary, getWordFromDictionary, config}) => {
      const fragment = await fragments("canobject can be canverb by cansubject")
      const context = fragment.contexts()[0]
      const contextPrime = await s({ ...context, toVoice: 'active', flatten: false }) // , { debug: { apply: true } })
      console.log(JSON.stringify(contextPrime, null, 2))
      const text = await gp(contextPrime)
      console.log(JSON.stringify(contextPrime.interpolate, null, 2))
      console.log(text)
      const expected = "cansubject can canverb canobject"
      expect(text).toBe(expected)
    })
  })

  test('NEOS23 to passive handles mixes list', async () => {
    await km.run(async ({fragments, s, gp, addWordToDictionary, getWordFromDictionary, config}) => {
      const fragmentPassive = await fragments("canobject can be canverb by cansubject")
      const contextPassive = fragmentPassive.contexts()[0]
      const fragmentActive = await fragments("cansubject can canverb canobject")
      const contextActive = fragmentActive.contexts()[0]
      
      const context = helpers.concats([contextPassive, contextActive])
      const contextPrime = await s({ ...context, toVoice: 'passive', flatten: false }) // , { debug: { apply: true } })
      console.log(JSON.stringify(contextPrime, null, 2))
      const text = await gp(contextPrime)
      console.log(JSON.stringify(contextPrime.interpolate, null, 2))
      console.log(text)
      const expected = "canobject can be canverbs by cansubject and canobject can be canverbed by cansubject"
      expect(text).toBe(expected)
    })
  })

  test('to active handles mixes list', async () => {
    await km.run(async ({fragments, s, gp, addWordToDictionary, getWordFromDictionary, config}) => {
      const fragmentPassive = await fragments("canobject can be canverb by cansubject")
      const contextPassive = fragmentPassive.contexts()[0]
      const fragmentActive = await fragments("cansubject can canverb canobject")
      const contextActive = fragmentActive.contexts()[0]
      
      const context = helpers.concats([contextPassive, contextActive])
      const contextPrime = await s({ ...context, toVoice: 'active', flatten: false }) // , { debug: { apply: true } })
      console.log(JSON.stringify(contextPrime, null, 2))
      const text = await gp(contextPrime)
      console.log(JSON.stringify(contextPrime.interpolate, null, 2))
      console.log(text)
      const expected = "cansubject can canverb canobject and cansubject can canverb canobject"
      expect(text).toBe(expected)
    })
  })
});
