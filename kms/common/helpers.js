const pluralize = require('pluralize')

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
  if (context.word && pluralize.isPlural(context.word)) {
    return true
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
    if (!context || !context.focusable) {
      return null
    }
    for (const property of context.focusable) {
      let focus = helper(context[property])
      if (!focus && (context[property] || {}).focus) {
        focus = context[property]
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
    return value
  } else if (value.marker == 'list') {
    return value.value
  } else {
    return [value]
  }
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

function defaultObjectCheck(extra = []) {
  return {
    objects: [
      {
        match: ({objects}) => true,
        apply: () => extra
      },
    ],
  }
}

function defaultContextCheckProperties(extra) {
  return ['marker', 'text', 'verbatim', 'value', 'evalue', 'isResponse', { properties: 'modifiers' }, { properties: 'postModifiers' }, ...extra]
}

function defaultContextCheck({marker, extra = [], exported = false} = {}) {
  let match
  if (marker) {
    match = ({context}) => context.marker == marker
  } else {
    match = ({context}) => !Array.isArray(context)
  }
  return {
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
  const path = propertyPath.split('.')
  let value = object
  for (const name of path) {
    if (!value) {
      break
    }
    value = value[name]
  }
  return value
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

// removeProp.js
function removeProp(obj, testFn, { maxDepth = Infinity, seen = new WeakSet() } = {}) {
  if (!obj || typeof obj !== 'object' || maxDepth <= 0) return obj;
  if (seen.has(obj)) return obj;
  seen.add(obj);

  if (Array.isArray(obj)) {
    // ---- ARRAY: process each element (but don't remove elements unless testFn says so)
    let writeIdx = 0;
    for (let i = 0; i < obj.length; i++) {
      const element = obj[i];
      const shouldRemoveElement = testFn(element, i, obj);

      if (shouldRemoveElement) {
        // Remove the whole array element
        if (element && typeof element === 'object') {
          // Still walk inside it in case testFn wants side effects
          removeProp(element, testFn, { maxDepth: maxDepth - 1, seen });
        }
        // Skip writing it back
      } else {
        // Keep element, but walk into it to remove inner props
        removeProp(element, testFn, { maxDepth: maxDepth - 1, seen });
        if (writeIdx !== i) {
          obj[writeIdx] = element;
        }
        writeIdx++;
      }
    }
    obj.length = writeIdx;
    return obj;
  }

  // ---- OBJECT: iterate over own keys
  const keys = Reflect.ownKeys(obj);
  for (const key of keys) {
    const val = obj[key];
    const shouldRemove = testFn(val, key, obj);

    if (shouldRemove) {
      delete obj[key];
      if (val && typeof val === 'object') {
        removeProp(val, testFn, { maxDepth: maxDepth - 1, seen });
      }
    } else {
      removeProp(val, testFn, { maxDepth: maxDepth - 1, seen });
    }
  }

  return obj;
}

module.exports = {
  processTemplateString,
  unshiftL,
  pushL,
  getValue,
  defaultContextCheck,
  defaultContextCheckProperties,
  defaultObjectCheck,
	toEValue,
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
  removeProp,
  concats
}
