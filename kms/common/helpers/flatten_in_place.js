const { debug } = require('../runtime').theprogrammablemind

const _ = require('lodash')

function flattenInPlace(context) {
  // Base case: nothing to flatten
  if (!context || !Array.isArray(context.flattenInPlace)) {
    return [_.cloneDeep(context)]
  }

  function expand(node) {
    if (!node || !Array.isArray(node.flattenInPlace)) {
      const copy = _.cloneDeep(node)
      if (copy && typeof copy === 'object') {
        ;(copy.flattenInPlaceRemove || []).forEach(k => delete copy[k])
        delete copy.flattenInPlace
        delete copy.flattenInPlaceRemove
        delete copy.isList
      }
      return [copy]
    }

    const groups = node.flattenInPlace
    const remove = node.flattenInPlaceRemove || []

    // Recursively expand every path mentioned in the groups
    const expanded = {}
    const allPaths = _.uniq(_.flatten(groups))
    for (const p of allPaths) {
      expanded[p] = expand(_.get(node, p))
    }

    // Convention used by the tests: the first path of the first group
    // (almost always "value") supplies the properties that become top-level.
    const basePath = groups[0][0]
    const baseKey = basePath.split('.').pop()
    const baseItems = expanded[basePath]

    // Build rows for the first group (zip by index)
    const firstGroup = groups[0]
    const firstRows = baseItems.map((_, idx) => {
      const row = {}
      for (const p of firstGroup) {
        const items = expanded[p]
        const item = items[Math.min(idx, items.length - 1)]
        const key = p.split('.').pop()
        row[key] = item
      }
      return row
    })

    // Build rows for every subsequent independent group
    const otherRows = groups.slice(1).map(group => {
      const len = Math.max(...group.map(p => expanded[p].length), 1)
      const rows = []
      for (let i = 0; i < len; i++) {
        const row = {}
        for (const p of group) {
          const items = expanded[p]
          const item = items[Math.min(i, items.length - 1)]
          const key = p.split('.').pop()
          row[key] = item
        }
        rows.push(row)
      }
      return rows
    })

    // Cartesian product of firstRows × all other groups
    let combos = firstRows
    for (const groupRows of otherRows) {
      const next = []
      for (const a of combos) {
        for (const b of groupRows) {
          next.push(Object.assign({}, a, b))
        }
      }
      combos = next
    }

    // Final objects: start from the base item, then attach the rest
    return combos.map(combo => {
      const result = Object.assign({}, combo[baseKey])

      for (const [k, v] of Object.entries(combo)) {
        if (k !== baseKey) {
          result[k] = v
        }
      }

      // Strip metadata
      remove.forEach(k => delete result[k])
      delete result.flattenInPlace
      delete result.flattenInPlaceRemove
      delete result.isList

      return result
    })
  }

  return expand(context)
}

module.exports = { flattenInPlace }
