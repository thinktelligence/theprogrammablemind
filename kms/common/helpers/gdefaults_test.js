const { interpolate } = require('./gdefaults')

function getArgs(context) {
  return {
    gsp: (contexts) => {
      return contexts.join('')
    },
    gp: (context) => {
      return context
    },
    // getWordFromDictionary: jest.fn(),
  }
}

describe('interpolate Tests', () => {
  it('NEOS23 property', async () => {
    const context = { name: 'greg' }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ property: 'name' }], context)
    expect(actual).toBe('greg')
  })

  it('NEOS23 string separator not used', async () => {
    const context = { first: 'greg', last: 'mcclement' }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ property: 'first' }, 'separator23'], context)
    expect(actual).toBe('greg')
  })

  it('NEOS23 string separator used', async () => {
    const context = { first: 'greg', last: 'mcclement' }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ property: 'first' }, 'separator23', { property: 'last' }], context)
    expect(actual).toBe('gregseparator23mcclement')
  })

  it('NEOS23 separator+value', async () => {
    const context = { values23: ['a', 'b', 'c'] }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ separator: '-', values: 'values23' }], context)
    expect(actual).toBe('ab-c')
  })

  it('NEOS23 context', async () => {
    const context = {}
    const args = getArgs(context)
    const actual = await interpolate(args)([{ context: 'value23' }], context)
    expect(actual).toBe('value23')
  })

  it('NEOS23 inside once', async () => {
    const context = { inner: { name: 'greg' } }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ inside: 'inner', value: { property: 'name' } }], context)
    expect(actual).toBe('greg')
  })

  it('NEOS23 inside twice', async () => {
    const context = { inner1: { inner2: { name: 'greg' } } }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ inside: 'inner1', value: { inside: 'inner2', value: { property: 'name' } } }], context)
    expect(actual).toBe('greg')
  })
})
