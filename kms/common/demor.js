global.theprogrammablemind = { loadForTesting:  { reports: true } }
const reports = require('./reports');

(async () => {
  const inputs = [
    "list the clothes",
    "list the models",
    "answer with sentences list the models",
    "answer with tables",
    "show the price",
    "list the products",
    "after the report changes show the report",
    "show the worth",
    "move column 3 to column 1",
    "remove column 2"
  ]
  for (const input of inputs) {
    const result = await reports.process(input)
    console.log('query', input);
    console.log('    ', result.responses)
  }
})();
