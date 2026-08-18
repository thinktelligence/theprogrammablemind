// flatten_in_place.js
function flattenInPlace(markersOrContext, maybeContext) {
  // Support both call signatures:
  //   flattenInPlace(context)
  //   flattenInPlace(['list'], context)
  let markers = []
  let context
  if (Array.isArray(markersOrContext)) {
    markers = markersOrContext
    context = maybeContext
  } else {
    context = markersOrContext
  }

  if (!context || typeof context !== 'object') {
    return [context]
  }

  const shouldFlatten =
    context.isList === true ||
    context.listable === true ||
    (Array.isArray(context.types) && context.types.some(t => markers.includes(t))) ||
    (context.marker && markers.includes(context.marker))

  if (!shouldFlatten || !Array.isArray(context.value) || context.value.length === 0) {
    return [context]
  }

  return context.value.map((item, idx) => {
    // 1. shallow copy of the list object
    const copy = { ...context }

    // 2. merge the list item’s own properties on top
    Object.assign(copy, item)

    // 3. the “value” of the resulting object is the leaf value of the item
    copy.value = item.value

    // 4. flatten any nested list-like properties (same length)
    for (const key of Object.keys(context)) {
      if (key === 'value') continue
      const nested = context[key]
      if (
        nested &&
        typeof nested === 'object' &&
        Array.isArray(nested.value) &&
        nested.value.length === context.value.length
      ) {
        copy[key] = nested.value[idx]
      }
    }

    // 5. strip list flags
    copy.listable = undefined
    copy.isList = undefined

    // 6. types come from the corresponding theable item (may be undefined)
    copy.types = copy.theable?.types

    return copy
  })
}

module.exports = { flattenInPlace }
