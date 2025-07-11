const pluralize = require('pluralize')

const unshiftL = (list, element, max) => {
  if (list.length >= max) {
    list.pop()
  }
  list.unshift(element)
}

const pushL = (list, element, max) => {
  if (list.length >= max) {
    list.shift()
  }
  list.push(element)
}

// X pm today or tomorrow
const millisecondsUntilHourOfDay = (newDate, hour) => {
  const now = newDate()
  const target = newDate(now)

  const addHours = (date, h) => {
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

const indent = (string, indent) => {
  return string.replace(/^/gm, ' '.repeat(indent));
}

const getCount = (context) => {
  if (context.quantity) {
    return context.quantity.value
  }
  if (context.determined) {
    return 1
  }
}

const words = (word, additional = {}) => {
  return [{ word: pluralize.singular(word), number: 'one', ...additional }, { word: pluralize.plural(word), number: 'many', ...additional }]
}

const isMany = (context) => {
  if (((context || {}).value || {}).marker == 'list' && (((context || {}).value || {}).value || []).length > 1) {
    return true
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

const requiredArgument = (value, name) => {
  if (!value) {
    throw new Error(`${name} is a required argument`)
  }
}

const chooseNumber = (context, one, many) => {
  if (isMany(context)) {
    return many;
  } else {
    return one;
  }
}

const zip = (...arrays) => {
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


const focus = (context) => {
  const helper = (context) => {
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
const propertyToArray = (value) => {
  if (Array.isArray(value)) {
    return value
  } else if (value.marker == 'list') {
    return value.value
  } else {
    return [value]
  }
}

wordNumber = (word, toPlural) => {
  if (toPlural) {
    return pluralize.plural(word)
  } else {
    return pluralize.singular(word)
  }
}

const toEValue = (context) => {
  while( context.evalue ) {
    context = context.evalue
  }
	return context;
}

const defaultContextCheckValidify = (properties) => {
  for (const value of properties) {
    if (typeof value == 'string') {
      continue
    }
    if (typeof value.property == 'string' && value.filter) {
      continue
    }
    throw new Error("Expected the <checks> argument to defaultContextCheck to be a list of <property> or { property: <property>, filter: <checks> }. Where <property> is a string.")
  }
}

const defaultContextCheckProperties = ['marker', 'text', 'verbatim', 'isResponse', { property: 'response', filter: ['marker', 'text', 'verbatim'] }] 

const expand_checks = (properties) => {
  const expanded = []
  for (const property of properties) {
    defaultContextCheckValidify(properties)
    if (typeof property == 'string') {
      expanded.push({ property, filter: defaultContextCheckProperties })
    } else {
      expanded.push({ property: property.property, filter: [...defaultContextCheckProperties, ...expand_checks(property.filter)] })
    }
  }
  return expanded
}

const defaultContextCheck = (properties = []) => {
  defaultContextCheckValidify(properties)
  return [
    ...defaultContextCheckProperties,
    // ...properties.map((property) => { return { property, filter: defaultContextCheckProperties } }),
    ...expand_checks(properties),
    (object) => {
      if (typeof object.value == 'object') {
        return { property: 'value', filter: defaultContextCheckProperties }
      } else {
        return 'value'
      }
    },
    (object) => {
      if (!Array.isArray(object.modifiers)) {
        return
      }
      if (typeof object.modifiers[0] == 'object') {
        return { property: 'modifiers', filter: defaultContextCheckProperties }
      } else {
        return 'modifiers'
      }
    },
    { property: 'modifiers', isPropertyList: true, filter: defaultContextCheckProperties }
  ]
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

const getValue = (propertyPath, object) => {
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

const processTemplateString = async (template, evaluate) => {
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
  defaultContextCheck,
  defaultContextCheckProperties,
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
}
