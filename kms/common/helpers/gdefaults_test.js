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
  it('property', async () => {
    const context = { name: 'greg' }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ property: 'name' }], context)
    expect(actual).toBe('greg')
  })

  it('string separator not used', async () => {
    const context = { first: 'greg', last: 'mcclement' }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ property: 'first' }, { separator: 'separator23' }], context)
    expect(actual).toBe('greg')
  })

  it('string separator used', async () => {
    const context = { first: 'greg', last: 'mcclement' }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ property: 'first' }, { separator: 'separator23' }, { property: 'last' }], context)
    expect(actual).toBe('gregseparator23mcclement')
  })

  it('string separator used is empty string', async () => {
    const context = { first: 'greg', last: 'mcclement' }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ property: 'first' }, { separator: '' }, { property: 'last' }], context)
    expect(actual).toBe('gregmcclement')
  })

  it('separator+value', async () => {
    const context = { values23: ['a', 'b', 'c'] }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ separator: '-', values: 'values23' }], context)
    expect(actual).toBe('ab-c')
  })

  it('separator+each+value', async () => {
    const context = { values23: ['a', 'b', 'c'] }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ separator: '-', values: 'values23', each: true  }], context)
    expect(actual).toBe('a-b-c')
  })

  it('context', async () => {
    const context = {}
    const args = getArgs(context)
    const actual = await interpolate(args)([{ context: 'value23' }], context)
    expect(actual).toBe('value23')
  })

  it('get by path depth 0', async () => {
    const context = { inner: { name: 'greg' } }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ property: 'inner.name' }], context)
    expect(actual).toBe('greg')
  })

  it('bug 1', async () => {
    const context = { inner: { name: 'greg' } }
    const args = getArgs(context)
    const actual = await interpolate(args)(['owned'], context)
    expect(actual).toBe('owned')
  })

  it('bug2', async () => {
    const context = { 
      constraints: [
        {
          constraint: {
            ownee: 'ownee23',
            owner: 'owner23',
          }
        }
      ]
    }
    const i = [ { "property": "constraints[0].constraint.ownee" }, "owned", "by", { "property": "constraints[0].constraint.owner" } ]

    const args = getArgs(context)
    const actual = await interpolate(args)(i, context)
    expect(actual).toBe('ownee23 owned by owner23')
  })

  it('bug3', async () => {
    const context = { 
      constraints: [
        {
          constraint: {
            ownee: 'ownee23',
            owner: 'owner23',
          }
        }
      ]
    }
    const i = [ { "property": "constraints[0].constraint.ownee" }, "owned", "by", { "property": "constraints[0].constraint.owner" } ]

    const args = getArgs(context)
    args.gp = (context) => {
      if (context == 'owner23') {
        return ""
      }
      return context
    }
    const actual = await interpolate(args)(i, context)
    expect(actual).toBe('ownee23 owned by')
  })

  it('inside once', async () => {
    const context = { inner: { name: 'greg' } }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ inside: 'inner', value: { property: 'name' } }], context)
    expect(actual).toBe('greg')
  })

  it('inside twice', async () => {
    const context = { inner1: { inner2: { name: 'greg' } } }
    const args = getArgs(context)
    const actual = await interpolate(args)([{ inside: 'inner1', value: { inside: 'inner2', value: { property: 'name' } } }], context)
    expect(actual).toBe('greg')
  })
})
