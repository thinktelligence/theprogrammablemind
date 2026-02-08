// declensions.test.js
const helpers = require('./helpers')
const numbersKM = require('./numbers')

describe('numbers km', () => {
  let km 

  beforeEach( async () => {
    km = await numbersKM({ useCache: false })
  })

  test('no rounding default', async () => {
    await km.run(async ({fragments, gp}) => {
      const fragment = await fragments("10.2345")
      const context = fragment.contexts()[0]
      console.log(JSON.stringify(context, null, 2))
      const actual = await gp(context)
      const expected = '10.2345'
      expect(actual).toBe(expected)
    })
  })

  test('specified rounding 0 digits', async () => {
    await km.run(async ({fragments, gp}) => {
      const fragment = await fragments("10.2345")
      const context = fragment.contexts()[0]
      console.log(JSON.stringify(context, null, 2))
      context.roundTo = 0
      const actual = await gp(context)
      const expected = '10'
      expect(actual).toBe(expected)
    })
  })

  test('specified rounding 2 digits', async () => {
    await km.run(async ({fragments, gp}) => {
      const fragment = await fragments("10.2345")
      const context = fragment.contexts()[0]
      console.log(JSON.stringify(context, null, 2))
      context.roundTo = 2
      const actual = await gp(context)
      const expected = '10.23'
      expect(actual).toBe(expected)
    })
  })

})
