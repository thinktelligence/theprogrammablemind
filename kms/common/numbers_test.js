// declensions.test.js
const helpers = require('./helpers')
const numbersKM = require('./numbers')

describe('numbers km', () => {
  let km 

  beforeEach( async () => {
    km = await numbersKM({ useCache: false })
  })

  test('NEOS23 no rounding default', async () => {
    await km.run(async ({fragments, gp}) => {
      const fragment = await fragments("10.2345")
      const context = fragment.contexts()[0]
      console.log(JSON.stringify(context, null, 2))
      const actual = await gp(context)
      const expected = '10.2345'
      expect(actual).toBe(expected)
    })
  })

  test('NEO23 specified rounding 0 digits', async () => {
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

  test('NEOS23 specified rounding 2 digits', async () => {
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

  /*
  test('NEO23 no rounding default', async () => {
    await km.run(async ({config, fragments, gp}) => {
      config.addOperator("([weight] ([amount]) ([unit]))"),
      config.addBridge({ id: "amount" })
      config.addBridge({ id: "unit" })
      config.addBridge({
        id: "weight",
        bro
      })
      const fragment = await fragments("10.2345")
      const context = fragment.contexts()[0]
      console.log(JSON.stringify(context, null, 2))
      const actual = await gp(context)
      const expected = '10.2345'
      expect(actual).toBe(expected)
    })
  })
  */
})
