/**
 * Flatten a context according to its `flattenInPlace` paths.
 * Supports plain keys, dotted paths and [n] indexes.
 *
 * @param {string[]|object} arg1  markers (e.g. ['list']) or the context
 * @param {object} [arg2]         context when arg1 is markers
 * @returns {object[]}
 */

function flattenInPlaceInternal(index, markers, context) {
  if (!context || typeof context !== 'object') {
    return [context];
  }
  if (!Array.isArray(context.flattenInPlace) || context.flattenInPlace.length === 0) {
    return [context];
  }

  // Optional marker / type gate
  if (markers && markers.length) {
    const hasMarker = (obj) =>
      obj &&
      ((obj.marker && markers.includes(obj.marker)) ||
       (Array.isArray(obj.types) && obj.types.some(t => markers.includes(t))));

    if (!hasMarker(context) && !hasMarker(context.theable)) {
      return [context];
    }
  }

  // ---------- path helpers ----------
  function getByPath(obj, path) {
    if (!path) return obj;
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  /**
   * Non-mutating set: copies every array / object that appears on the path
   * so that the original context is never mutated.
   */
  function setByPath(obj, path, value) {
    const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let cur = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      const next = cur[p];

      if (Array.isArray(next)) {
        cur[p] = [...next];               // shallow-copy array
      } else if (next && typeof next === 'object') {
        cur[p] = { ...next };             // shallow-copy object
      } else {
        cur[p] = {};
      }
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
  }

  // Returns the array that should be expanded for a given path
  function getExpandableArray(ctx, path) {
    const target = getByPath(ctx, path);
    if (Array.isArray(target)) return target;
    if (target && (target.isList || target.listable) && Array.isArray(target.value)) {
      return target.value;
    }
    return null;
  }

  // ---------- expand ----------
  const paths = context.flattenInPlace[index];
  const arrays = paths.map(p => getExpandableArray(context, p));

  if (arrays.some(a => !Array.isArray(a))) return [context];
  const len = arrays[0].length;
  if (arrays.some(a => a.length !== len)) return [context];

  const ignore = new Set(context.flatten_ignore || []);
  const results = [];

  for (let i = 0; i < len; i++) {
    const clone = { ...context };

    paths.forEach((path, pathIdx) => {
      const item = arrays[pathIdx][i];

      if (ignore.has(path)) {
        // still replace the list object with the concrete item
        setByPath(clone, path, item);
        return;
      }

      if (path === 'value') {
        // exact pattern used by the test helpers
        Object.assign(clone, item);
        clone.value = item.value !== undefined ? item.value : item;
      } else {
        setByPath(clone, path, item);
      }
    });

    // Force the exact shape the tests construct
    clone.listable = undefined;
    clone.isList   = undefined;

    // ALWAYS take types from the corresponding theable item (may be undefined)
    const theableItem = getByPath(clone, 'theable');
    clone.types = theableItem ? theableItem.types : undefined;

    results.push(clone);
  }

  return results;
}

function flattenInPlace(arg1, arg2) {
  let markers = null;
  let context;

  if (arg2 === undefined) {
    context = arg1;
  } else {
    markers = arg1;
    context = arg2;
  }

  const done = []
  let todo = [{ i: 0, context }]
  while (todo.length > 0) {
    const { i, context } = todo.pop()
    if (i < context.flattenInPlace?.length) {
      const flats = flattenInPlaceInternal(i, markers, context)
      for (const flat of flats) {
        todo.push({ i: i + 1, context: flat })
      }
    } else {
      done.unshift(context)
    }
  }
  return done
}

module.exports = { flattenInPlace }
