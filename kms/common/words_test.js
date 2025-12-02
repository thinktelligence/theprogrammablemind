// declensions.test.js
const wordsKM = require('./words');

describe('words km', () => {
  let km 

  beforeEach( async () => {
    km = await wordsKM({ useCache: false })
  })

  // 2nd Declension Tests
  test('NEOS23 no find', async () => {
    await km.run(({addWordToDictionary, getWordFromDictionary, config}) => {
      const word = {
        id: 'be',
        value: 'be',
        text: 'be',
        tense: 'infinitive',
      }
      addWordToDictionary(word)
      const match = getWordFromDictionary({ id: 'be2' })
      expect(match).toBe(undefined)
    })
  })

  test('NEO23 finds one', async () => {
    await km.run(({addWordToDictionary, getWordFromDictionary, config}) => {
      const word = {
        id: 'be',
        value: 'be',
        text: 'be',
        tense: 'infinitive',
      }
      addWordToDictionary(word)
      const match = getWordFromDictionary({ id: 'be' })
      expect(match).toBe(word)
    })
  })

  test('NEOS23 finds first', async () => {
    await km.run(({addWordToDictionary, getWordFromDictionary, config}) => {
      const word = {
        id: 'be',
        value: 'be',
        text: 'be',
        tense: 'infinitive',
      }
      addWordToDictionary(word)
      addWordToDictionary({ ...word, value: 'otherOne' })
      const match = getWordFromDictionary({ id: 'be' })
      expect(match).toBe(word)
    })
  })
});
