const { propertyToArray } = require('../helpers.js')

function asList(context, maybe=false) {
  if (Array.isArray(context)) {
    const noEmptyLists = []
    for (const value of context) {
      if (!value) {
        continue
      }
      if (value.marker == 'list' && value.value.length == 0) {
        continue
      }
      noEmptyLists.push(value)
    }
    if (maybe) {
      if (noEmptyLists.length == 1) {
        return noEmptyLists[0]
      }
    }
    return {
      marker: 'list',
      // types: [context.marker],
      listable: true,
      value: noEmptyLists
    }
  } else if (context.marker === 'list') {
    return context
  }

  if (maybe) {
    return context
  } else {
    return {
      marker: 'list',
      listable: true,
      types: [context.marker],
      value: [context]
    }
  }
}

function listable(hierarchy) {
  return (c, type) => {
    if (!c) {
      return false
    }
    if (hierarchy.isA(c.marker, type)) {
      return true
    }
    if (c.marker === 'list') {
      for (const t of c.types) {
        if (hierarchy.isA(t, type)) {
          return true
        }
      }
    }
    return false
  }
}

function isA(hierarchy) {
  const getId = (context) => {
    if (typeof context === 'string') {
      return context
    }
    if (context.marker === 'unknown') {
      return context.value
    }
    return context.marker
  }

  return (child, parent, { strict=false } = {}) => {
    const oneToOne = (child, parent) => {
      if (!child || !parent) {
        return false
      }

      if (strict) {
        if (child.marker) {
          child = child.marker
        }
        if (parent.marker) {
          parent = parent.marker
        }
        return hierarchy.isA(child, parent)
      } else {
        const children = propertyToArray(child)
        for (const child of children) {
          let okay = false
          if (hierarchy.isA(getId(child), getId(parent))) {
            okay = true
          } else {
            for (const childT of child.types || [child]) {
              if (okay) {
                break
              }
              for (const parentT of parent.types || [parent]) {
                if (hierarchy.isA(childT, parentT)) {
                  okay = true
                  break
                }
              }
            }
          }
          if (!okay) {
            return false
          }
        }
        return true
      }
    }
    if (Array.isArray(parent)) {
      const parents = parent
      for (const parent of parents) {
        if (oneToOne(child, parent)) {
          return true
        }
      }
      return false
    } else {
      return oneToOne(child, parent)
    }
  }
}

module.exports = {
  asList,
  isA,
  listable,
}
