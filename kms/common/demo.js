const scorekeeper = require('./scorekeeper');

// const result = scorekeeper.process("start a new game")
(async () => {
  const inputs = [
    'start a new game',
    'greg estelle and joe',
    'who are the players',
    '100 points',
    'what is the winning score',
    'joe got 10 points',
    'greg got 15 points',
    'estelle got 25 points',
    'what is the score',
    'joe got 200 points',
  ]
  for (let input of inputs) {
    const result = await scorekeeper.process(input)
    console.log('query', input);
    console.log('    ', result.responses)
  }
})();
