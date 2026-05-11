// declensions.test.js
const helpers = require('./helpers')
const KM = require('./stm')

describe('numbers km', () => {
  let km 

  beforeEach( async () => {
    km = await KM({ useCache: false })
  })

  test('NEOS23 addCallback', async () => {
    await km.run(async ({remember, recall, addCallback}) => {
      await remember({ marker: 'test' })
      const obj = await recall({ context: { marker: 'test' } })
      const fn = jest.fn()
      const id = addCallback(obj, fn)
      expect(id).toBe(2)
    })
  })

  test('NEOS23 removeCallback', async () => {
    await km.run(async ({remember, recall, addCallback}) => {
      await remember({ marker: 'test' })
      const obj = await recall({ context: { marker: 'test' } })
      const fn = jest.fn()
      const id = addCallback(obj, fn)
      expect(id).toBe(2)
      console.log(JSON.stringify(obj, null, 2))
      expect(obj.namespaced.stm.callbacks[0].counter).toBe(2)
      fn.removeCallback()
      console.log(JSON.stringify(obj, null, 2))
      expect(obj.namespaced.stm.callbacks.length).toBe(0)
    })
  })

  test('NEO23 callback on delete', async () => {
    await km.run(async ({remember, recall, s, addCallback}) => {
      await remember({ marker: 'test' })
      const obj = await recall({ context: { marker: 'test' } })
      const fn = jest.fn()
      const id = addCallback(obj, fn)
      await s({ marker: 'delete', deletable: { marker: 'test' }})
      expect(fn).toHaveBeenCalled()
    })
  })
})
