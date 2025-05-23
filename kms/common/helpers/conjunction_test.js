const { isA } = require('./conjunction.js')
const DigraphInternal = require('../../node_modules/theprogrammablemind/src/digraph_internal.js')

describe('conjucntion helpers Tests', () => {
  describe('isA', () => {
    describe('default', () => {
      it('no child', () => {
        hierarchy = new DigraphInternal()
        const isAI = isA(hierarchy)
        expect(isAI(null, 'b')).toBe(false)
      })
      it('no parent', () => {
        hierarchy = new DigraphInternal()
        const isAI = isA(hierarchy)
        expect(isAI('a', null)).toBe(false)
      })
      it('child+parent no link', () => {
        hierarchy = new DigraphInternal()
        const isAI = isA(hierarchy)
        expect(isAI('a', 'b')).toBe(false)
      })
      it('child+parent has link', () => {
        hierarchy = new DigraphInternal([['a', 'b']])
        const isAI = isA(hierarchy)
        expect(isAI('a', 'b')).toBe(true)
      })
      it('child+parent has link, child is context', () => {
        hierarchy = new DigraphInternal([['a', 'b']])
        const isAI = isA(hierarchy)
        expect(isAI({ marker: 'a' }, 'b')).toBe(true)
      })
      it('child+parent has link, parent is context', () => {
        hierarchy = new DigraphInternal([['a', 'b']])
        const isAI = isA(hierarchy)
        expect(isAI('a', { marker: 'b'})).toBe(true)
      })
      it('child+parent has link, child is list', () => {
        const child = {
          isList: true,
          level: 1,
          listable: true,
          marker: "list",
          value: [
            { marker: "bold" },
            { marker: "underlined" },
          ],
        }

        hierarchy = new DigraphInternal([['bold', 'style'], ['underlined', 'style']])
        const isAI = isA(hierarchy)
        expect(isAI(child, { marker: 'style'})).toBe(true)
      })

      it('child+parent no link, child is list', () => {
        const child = {
          isList: true,
          level: 1,
          listable: true,
          marker: "list",
          value: [
            { marker: "bold" },
            { marker: "underlined" },
          ],
        }

        hierarchy = new DigraphInternal([['bold', 'style']])
        const isAI = isA(hierarchy)
        expect(isAI(child, { marker: 'style'})).toBe(false)
      })
    })
  })
})
