// declensions.test.js
const wordsKM = require('./words');

describe('words km', () => {
  let km 

  beforeEach( async () => {
    km = await wordsKM({ useCache: false })
  })

  // 2nd Declension Tests
  test('NEOS23 no find', async () => {
    await km.run(({addWord, getWord, config}) => {
      const word = {
        id: 'be',
        value: 'be',
        text: 'be',
        tense: 'infinitive',
      }
      addWord(word)
      const match = getWord({ id: 'be2' })
      expect(match).toBe(undefined)
    })
  })

  test('NEO23 finds one', async () => {
    await km.run(({addWord, getWord, config}) => {
      const word = {
        id: 'be',
        value: 'be',
        text: 'be',
        tense: 'infinitive',
      }
      addWord(word)
      const match = getWord({ id: 'be' })
      expect(match).toBe(word)
    })
  })

  test('NEOS23 finds first', async () => {
    await km.run(({addWord, getWord, config}) => {
      const word = {
        id: 'be',
        value: 'be',
        text: 'be',
        tense: 'infinitive',
      }
      addWord(word)
      addWord({ ...word, value: 'otherOne' })
      const match = getWord({ id: 'be' })
      expect(match).toBe(word)
    })
  })
});
