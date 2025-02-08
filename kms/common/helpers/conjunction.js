const { propertyToArray } = require('../helpers.js')

const asList = (context) => {
  if (context.marker === 'list') {
    return context
  }
  return {
    marker: 'list',
    types: [context.marker],
    value: [context]
  }
}

const listable = (hierarchy) => (c, type) => {
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

const isA = (hierarchy) => (child, parent, { strict=false } = {}) => {
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
    for (let child of children) {
      let okay = false
      if (hierarchy.isA(child.marker || child, parent.marker || parent)) {
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

module.exports = {
  asList,
  isA,
  listable,
}
