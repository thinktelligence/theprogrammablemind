const reports = require('./reports');

// rebuild to pick up the test endpoints. they dont load for the module case
reports.rebuild({ isModule: false });

(async () => {
  const inputs = [
    "list the models",
    "list the clothes",
    "answer with sentences list the models",
    "answer with tables",
    "list them",
    "show the price",
    "list them",
    "after the report changes show the report",
    "show the quantity descending and the price ascending",
    "list them",
    "call this report1",
    "show report1",
    "move column 2 to column 1",
    "remove column 3",
    "show report1",
  ]
  for (let input of inputs) {
    try{
      const result = await reports.process(input);
      console.log("query", input)
      for (let line of result.responses) {
        console.log(line)
      }
    } catch( e ){
      // console.log(e)
    }
  }
})();
