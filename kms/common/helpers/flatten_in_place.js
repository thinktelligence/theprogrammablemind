const { debug, getByPath, setByPath } = require('../runtime').theprogrammablemind

const _ = require('lodash')

function getPaths(context) {
  const todo = [{context, path: []}]
  const paths = (context.flattenInPlace || []).map((_) => [])
  while (todo.length > 0) {
    let { context, groupIndex, path } = todo.pop()
    if (context?.flattenInPlace) {
      for (const [currentGroupIndex, props] of context.flattenInPlace.entries()) {
        nextGroupIndex = groupIndex ?? currentGroupIndex
        for (const prop of props) {
          if (prop == 'value') {
            paths[nextGroupIndex].push([...path, prop])
          } else {
            todo.push({ context: getByPath(context, prop), groupIndex: nextGroupIndex, path: [...path, prop] })
          }
        }
      }
    }
  }
  return paths.filter((paths) => paths.length > 0)
}

function remove(context) {
  for (const prop of context.flattenInPlaceRemove || []) {
    delete context[prop]
  }
  delete context.flattenInPlace
  delete context.flattenInPlaceRemove
  return context
}

function flattenInPlace(context) {
  const paths = getPaths(context)
  if (paths.length == 0) {
    return [context]
  }
  let currents = [context]
  for (const pathGroup of paths) {
    const src = getByPath(context, pathGroup[0].slice(0, -1))
    if (!src.isList) {
      remove(context)
      currents = [context]
      continue
    }
    const n = getByPath(context, pathGroup[0]).length
    const nexts = []
    for (const current of currents) {
      for (let i = 0; i < n; ++i) {
        const nxt = _.cloneDeep(current)
        if (true || nxt.isList) {
          for (const path of pathGroup) {
            const value = getByPath(context, path)[i]
            const dest = getByPath(nxt, path.slice(0, -1))
            remove(dest)
            Object.assign(dest, value)
          }
          nexts.push(nxt)
        } else {
          remove(nxt)
          nexts.push(nxt)
        }
      }
    }
    currents = nexts
  }
  return currents
}

module.exports = { remove, flattenInPlace, getPaths }
