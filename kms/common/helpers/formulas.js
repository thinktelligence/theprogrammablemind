operators = ['plus', 'minus', 'times', 'divideBy']

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

const match = (values, head, value) => {
  for (let prop in head) {
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
  for (let prop in values) {
    if (!values[prop]) {
      return
    }
  }
  return true
}

const unify = (rule, value) => {
  const values = { ...rule.values }
  if (match(values, rule.head(values), value)) {
    return rule.body(values)
  }
}

const f = (values, variable) => (value) => {
  if (!value) {
    debugger
    throw new Error("Value not present")
  }
  if (values[variable] && values[variable] != value) {
    debugger
    throw new Error("Variable already set to different value")
  }
  values[variable] = value
  return true
}

const rules = [
  // same
  {
    values: { x: null, y: null },
    head: (values) => { return { marker: 'equals', left: f(values, 'x'), right: f(values, 'y') } },
    body: ({x, y}) => { return { marker: 'equals', left: x, right: y } }
  },
  // reflexive
  {
    values: { x: null, y: null },
    head: (values) => { return { marker: 'equals', left: f(values, 'x'), right: f(values, 'y') } },
    body: ({x, y}) => { return { marker: 'equals', left: y, right: x } }
  },
  /*
  {
    values: { x: null, y: null, z: null },
    head: (values) => { return { marker: 'equals', left: f(values, 'x'), right: { marker: "+", x: f(values, 'y'), y: f(values, 'z') } } },
    body: ({x, y, z}) => { return { marker: 'equals', left: x, right: { marker: "+", x: y, y: z } } }
  },
  */
]

function solveFor(expression, variable, isVariable = (expression) => typeof expression.value != 'number') {
  const sameVar = (c1, c2) => {
    return c1.value == c2.value
  }

  /*
  for (let rule of rules) {
    debugger
    const body = unify(rule, expression)
    const lVars = getVariables(body.left, isVariable)
    const rVars = getVariables(body.right, isVariable)
    if (lVars.length == 1 && sameVar(lVars[0], variable) && !rVars.some((c) => sameVar(c, variable))) {
      return body
    }
  }
  */

  const lVars = getVariables(expression.left, isVariable)
  const rVars = getVariables(expression.right, isVariable)
  if (lVars.length == 1 && sameVar(lVars[0], variable) && !rVars.some((c) => sameVar(c, variable))) {
    return expression
  }
  if (rVars.length == 1 && sameVar(rVars[0], variable) && !lVars.some((c) => sameVar(c, variable))) {
    return { ...expression, left: expression.right, right: expression.left }
  }
}

class API {
  initialize() {
    this.objects.formulas = {}
  }

  gets(name) {
    if (!this.objects.formulas[name.value]) {
      return []
    }
    if (this.objects.formulas[name.value].length == 0) {
      return []
    }
    return this.objects.formulas[name.value]
  }

  get(name, expectedVars) {
    if (expectedVars) {
      const fs = this.gets(name);
      for (let f of fs) {
        const foundVars = getVariables(f.formula)
        if (foundVars.length == expectedVars.length) {
          for (let ev of expectedVars) {
            if (!foundVars.find( (fv) => fv.value == ev.value )) {
              continue
            }
          }
          return f.formula;
        }
      }
    } else {
      return this.gets(name)[0]
    }
  }

  // currently only supportings x = f(x) type formulas
  add(name, formula, equality) {
    if (!this.objects.formulas[name.value]) {
      this.objects.formulas[name.value] = []
    }
    this.objects.formulas[name.value].push({ name, formula, equality })
  }

  remove(name) {
    if (!this.objects.formulas[name.value]) {
      return
    }
    this.objects.formulas[name.value].pop()
  }
}


module.exports = {
  getVariables,
  solveFor,
  unify,
  rules,
  API,
}
