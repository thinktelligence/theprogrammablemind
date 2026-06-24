operators = ['plusExpression', 'minusExpression', 'timesExpression', 'divideByExpression']

function getVariables(expression, isVariable = (expression) => typeof expression.value != 'number') {
  if (!expression) {
    return []
  }
  if (operators.includes(expression.marker)) {
    return getVariables(expression.x, isVariable).concat(getVariables(expression.y, isVariable)).sort()
  }
  if (isVariable(expression)) {
    return [expression]
  }
  return []
}

function match(values, head, value) {
  for (const prop in head) {
    if (head[prop] instanceof Function) {
      if (!head[prop](value[prop])) {
        return
      }
    } else if (head[prop] instanceof Object) {
      return match(values, head[prop], value[prop])
    } else if (head[prop] != value[prop]) {
      return
    }
  }
  for (const prop in values) {
    if (!values[prop]) {
      return
    }
  }
  return true
}

async function unify(rule, value) {
  const values = { ...rule.values }
  if (match(values, rule.head(values), value)) {
    return await rule.body(values)
  }
}

function f(values, variable) {
  return (value) => {
    if (!value) {
      throw new Error("Value not present")
    }
    if (values[variable] && values[variable] != value) {
      throw new Error("Variable already set to different value")
    }
    values[variable] = value
    return true
  }
}

const headConstructor = {
  equals: (x, y) => {
    return { marker: 'equals', left: x, right: y }
  },
  add: (x, y) => {
    return { marker: 'plusExpression', x, y }
  },
  subtract: (x, y) => {
    return { marker: 'minusExpression', x, y }
  },
  multiply: (x, y) => {
    return { marker: 'timesExpression', x, y }
  },
  divide: (x, y) => {
    return { marker: 'divideByExpression', x, y }
  },
}

function rules({ equals, add, subtract, multiply, divide}) {
  return [
    // same
    {
      values: { x: null, y: null },
      head: (values) => headConstructor.equals(f(values, 'x'), f(values, 'y')),
      body: async ({x, y}) => await equals(x, y),
    },
    // reflexive
    {
      values: { x: null, y: null },
      head: (values) => headConstructor.equals(f(values, 'x'), f(values, 'y')),
      body: async ({x, y}) => await equals(y, x),
    },
    // x = y + z => y = x - z
    {
      values: { x: null, y: null, z: null },
      head: (values) => headConstructor.equals(f(values, 'x'), headConstructor.add(f(values, 'y'), f(values, 'z'))),
      body: async ({x, y, z}) => await equals(y, await subtract(x, z)),
    },
    // x = y - z => y = x + z
    {
      values: { x: null, y: null, z: null },
      head: (values) => headConstructor.equals(f(values, 'x'), headConstructor.subtract(f(values, 'y'), f(values, 'z'))),
      body: async ({x, y, z}) => await equals(y, await add(x, z))
    },
    // x = y * z => y = x / z
    {
      values: { x: null, y: null, z: null },
      head: (values) => headConstructor.equals(f(values, 'x'), headConstructor.multiply(f(values, 'y'), f(values, 'z'))),
      body: async ({x, y, z}) => await equals(y, await divide(x, z))
    },
    // x = y / z => y = x * z
    {
      values: { x: null, y: null, z: null },
      head: (values) => headConstructor.equals(f(values, 'x'), headConstructor.divide(f(values, 'y'), f(values, 'z'))),
      body: async ({x, y, z}) => await equals(y, await multiply(x, z))
    },
  ]
}

async function solveFor(constructors, expression, variable, isVariable = (expression) => typeof expression.value != 'number') {
  function sameVar(c1, c2) {
    return c1.value == c2.value
  }

  const lVars = getVariables(expression.left, isVariable)
  const rVars = getVariables(expression.right, isVariable)

  if (lVars.length == 1 && sameVar(lVars[0], variable) && !rVars.some((c) => sameVar(c, variable))) {
    return expression
  }

  for (const rule of rules(constructors)) {
    const transformation = await unify(rule, expression)
    if (transformation && sameVar(variable, transformation.left)) {
      return transformation
    }
  }

  if (rVars.length == 1 && sameVar(rVars[0], variable) && !lVars.some((c) => sameVar(c, variable))) {
    return { ...expression, left: expression.right, right: expression.left }
  }

}

class API {
  initialize({ objects }) {
    this._objects = objects
    this._objects.formulas = {}
  }

  gets(name) {
    if (!this._objects.formulas[name.value]) {
      return []
    }
    if (this._objects.formulas[name.value].length == 0) {
      return []
    }
    return this._objects.formulas[name.value]
  }

  get(name, expectedVars) {
    if (expectedVars) {
      const fs = this.gets(name);
      for (const f of fs) {
        const foundVars = getVariables(f.formula)
        if (foundVars.length == expectedVars.length) {
          let failed = false
          for (const ev of expectedVars) {
            if (!foundVars.find( (fv) => fv.value == ev.value )) {
              failed = true
              break
            }
          }
          if (!failed) {
            return f.formula;
          }
        }
      }
    } else {
      return this.gets(name)[0]
    }
  }

  // currently only supportings x = f(x) type formulas
  add(name, formula, equality) {
    if (!this._objects.formulas[name.value]) {
      this._objects.formulas[name.value] = []
    }
    this._objects.formulas[name.value].push({ name, formula, equality })
  }

  remove(name) {
    if (!this._objects.formulas[name.value]) {
      return
    }
    this._objects.formulas[name.value].pop()
  }
}


module.exports = {
  getVariables,
  solveFor,
  unify,
  rules,
  API,
}
