operators = ['plus', 'minus', 'times', 'divideBy']

function getVariables(expression) {
  if (operators.includes(expression.marker)) {
    return getVariables(expression.x).concat(getVariables(expression.y)).sort()
  }
  return [expression]
}

function solveFor(expression, variable) {
}

module.exports = {
  getVariables,
}
