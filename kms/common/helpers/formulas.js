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

function solveFor(expression, variable, isVariable = (expression) => typeof expression.value != 'number') {
  const lVars = getVariables(expression.left, isVariable)
  const rVars = getVariables(expression.right, isVariable)
  const sameVar = (c1, c2) => {
    return c1.value == c2.value
  }
  if (lVars.length == 1 && sameVar(lVars[0], variable) && !rVars.some((c) => sameVar(c, variable))) {
    return expression
  }
  if (rVars.length == 1 && sameVar(rVars[0], variable) && !lVars.some((c) => sameVar(c, variable))) {
    return { ...expression, left: expression.right, right: expression.left }
  }
}

module.exports = {
  getVariables,
  solveFor,
}
