const pluralize = require('pluralize')
const { flatten, debug } = require('./runtime').theprogrammablemind
// const { asList } = require('./helpers/conjunction.js')

/**
 * Memoize an async function.
 * @param {Function} fn - The expensive async function
 * @param {Object} [options]
 * @param {Function} [options.keyFn] - How to turn arguments into a cache key
 * @param {boolean} [options.cacheErrors=false] - Whether to cache rejected promises
 */
function memoizeAsync(fn, options = {}) {
  const {
    keyFn = (...args) => JSON.stringify(args),
    cacheErrors = false,
  } = options;

  const cache = new Map();

  return async function (...args) {
    const key = keyFn(...args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const promise = fn.apply(this, args).catch((err) => {
      if (!cacheErrors) {
        cache.delete(key); // allow retry on failure
      }
      throw err;
    });

    cache.set(key, promise);
    return promise;
  };
}

function unshiftL(list, element, max) {
  if (list.length >= max) {
    list.pop()
  }
  list.unshift(element)
}

function pushL(list, element, max) {
  if (list.length >= max) {
    list.shift()
  }
  list.push(element)
}

// X pm today or tomorrow
function millisecondsUntilHourOfDay(newDate, hour) {
  const now = newDate()
  const target = newDate(now)

  function addHours(date, h) {
    date.setTime(date.getTime() + (h*60*60*1000));
  }
  const hours = target.getHours()
  if (hours == hour) {
    return 0
  }
  if (hours > hour) {
    addHours(target, 24)
  }
  target.setHours(hour, 0, 0, 0)
  var diff = Math.abs(target - now);
  return diff;
}

function indent(string, indent) {
  return string.replace(/^/gm, ' '.repeat(indent));
}

function getCount(context) {
  if (context.quantity) {
    return context.quantity.value
  }
  if (context.determined) {
    return 1
  }
}

function words(word, additional = {}) {
  return [{ word: pluralize.singular(word), number: 'one', ...additional }, { word: pluralize.plural(word), number: 'many', ...additional }]
}

function isMany(context) {
  if (!context) {
    return
  }
  // if (((context || {}).value || {}).marker == 'list' && (((context || {}).value || {}).value || []).length > 1) {
  const isList = context.marker == 'list' || context.value?.marker == 'list'
  if (isList) {
    if (context.value?.length > 1) {
      return true
    }
    if (context.value?.value?.length > 1) {
      return true
    }
  }

  let number = context.number
  if (context.quantity) {
    if (context.quantity.number) {
      number = context.quantity.number
    } else if (context.quantity.value !== 1) {
      number = 'many'
    }
  }

  if (number == 'many') {
    return true
  }
  if (number == 'one') {
    return false
  }
  if (context.word) {
    if (pluralize.isPlural(context.word) && pluralize.isSingular(context.word)) {
      return
    } 
    if (pluralize.isPlural(context.word)) {
      return true
    }
  }
  return false
}

function requiredArgument(value, name) {
  if (!value) {
    throw new Error(`${name} is a required argument`)
  }
}

function chooseNumber(context, one, many) {
  if (isMany(context)) {
    return many;
  } else {
    return one;
  }
}

function zip(...arrays) {
  if (arrays == []) {
    return []
  }
  const zipped = []
  for(let i = 0; i < arrays[0].length; i++){
    const tuple = []
    for (const array of arrays) {
      tuple.push(array[i])
    }
    zipped.push(tuple)
  }
  return zipped
}


function focus(context) {
  function helper(context) {
    let focusable = context?.focusable
    if (!focusable && context.marker == 'list') {
      focusable = ['value']
    }
    if (!focusable) {
      return null
    }
    for (const property of focusable) {
      if (Array.isArray(context[property])) {
        const array = context[property]
        const focussed = []
        for (const value of array) {
          const focus = helper(value)
          if (focus) {
            focussed.push(focus)
          }
        }
        if (focussed) {
          return focussed
        }
        continue
      }

      let focus = helper(context[property])
      if (!focus) {
        const flat = flatten(['list'], context[property])[0]
        for (const element of flat) {
          if (element.focus) {
            focus = context[property]
            break
          }
        }
      }
      return focus
    }
    return null
  }
  return helper(context) || context
}

// if property is a list make array of elements of the list, if not return an array with the property value
// fromList
function propertyToArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value?.listable || value?.marker == 'list') {
    return value.value.flatMap(item => propertyToArray(item));
  }

  // Single value → wrap in array
  return [value];
}

// values is marker: 'list' or some context
function concats(values) {
  combined = []
  for (const value of values) {
    if (value.marker == 'list') {
      combined = combined.concat(value.value)
    } else {
      combined.push(value)
    }
  }
  return {
    marker: 'list',
    listable: true,
    value: combined
  }
}

function wordNumber(word, toPlural) {
  if (toPlural) {
    return pluralize.plural(word)
  } else {
    return pluralize.singular(word)
  }
}

function toEValue(context) {
  while( context.evalue ) {
    context = context.evalue
  }
	return context;
}

function toFinalValue(context) {
  while( context.evalue || context.value ) {
    if (context.evalue) {
      context = context.evalue
    } else {
      context = context.value
    }
  }
  return context;
}

function defaultObjectCheck(extra = []) {
  return {
    objects: [
      {
        extra,
        match: ({objects}) => true,
        apply: () => extra
      },
    ],
  }
}

function defaultContextCheckProperties(extra = []) {
  return ['marker', 'text', 'verbatim', 'value', 'evalue', 'isResponse', { properties: 'modifiers' }, { properties: 'postModifiers' }, ...extra]
}

function defaultContextCheck({marker, extra = [], exported = false} = {}) {
  let match
  if (marker) {
    match = ({context}) => context.marker == marker
  } else {
    match = () => true
  }
  return {
    marker,
    match,
    exported,
    apply: () => ['marker', 'text', 'verbatim', 'value', 'evalue', 'isResponse', { properties: 'modifiers' }, { properties: 'postModifiers' }, ...extra],
  }
}

function isA(hierarchy) {
  return (child, parent, { strict=false } = {}) => {
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
      if (hierarchy.isA(child.marker || child, parent.marker || parent)) {
        return true
      }
      for (const childT of child.types || [child]) {
        for (const parentT of parent.types || [parent]) {
          if (hierarchy.isA(childT, parentT)) {
            return true
          }
        }
      }
      return false
    }
  }
}

function getValue(propertyPath, object) {
  if (!propertyPath) {
    return
  }
  let path = propertyPath
  if (typeof path == 'string') {
    path = propertyPath.split('.')
  }
  let value = object
  for (const name of path) {
    if (!value) {
      break
    }
    value = value[name]
  }
  return value
}

function setValue(propertyPath, object, newValue) {
  if (!propertyPath) {
    return;
  }
  let path = propertyPath;
  if (typeof path === 'string') {
    path = propertyPath.split('.');
  }
  let current = object;
  for (let i = 0; i < path.length; i++) {
    const name = path[i];
    if (i === path.length - 1) {
      // Set the value at the final step
      current[name] = newValue;
      break;
    }
    if (current[name] === undefined || current[name] === null) {
      current[name] = {};  // Create a plain object for nesting
    }
    current = current[name];
  }
}

async function processTemplateString(template, evaluate) {
  async function resolveWithCallback(strings, ...keys) {
    // const resolvedValues = await Promise.all(keys.map(key => lookupVariable(key)));
    const resolvedValues = await Promise.all(keys.map(async (key) => {
      return await evaluate(key)
    }))

    let result = strings[0];
    for (let i = 0; i < resolvedValues.length; i++) {
      result += resolvedValues[i] + strings[(i + 1)*2];
    }
    return result;
  }

  async function processTemplateString(template) {
    // Split the template into strings and keys
    const parts = template.split(/(\${[^}]+})/g);
    const strings = [];
    const keys = [];
    for (const part of parts) {
      if (part.startsWith("${") && part.endsWith("}")) {
        keys.push(part.slice(2, -1)); // Extract key (e.g., "name" from "${name}")
        strings.push(""); // Placeholder for interpolation
      } else {
        strings.push(part);
      }
    }

    // Ensure the strings array has one more element than keys
    if (strings.length === keys.length) {
      strings.push("");
    }

    // Pass to the tagged template function
    return resolveWithCallback(strings, ...keys);
  }

  return await processTemplateString(template)
}

module.exports = {
  processTemplateString,
  unshiftL,
  pushL,

  getValue,
  setValue,

  defaultContextCheck,
  defaultContextCheckProperties,
  defaultObjectCheck,
	toEValue,
  toFinalValue,
  millisecondsUntilHourOfDay,
  indent,
  isMany,
  getCount,
  chooseNumber,
  zip,
  focus,
  words,
  propertyToArray,
  wordNumber,
  requiredArgument,
  isA,
  concats,
  memoizeAsync,
}
