/*
This is what the output looks like

Running the input: sally worked 10 weeks
This is the objects from running semantics:
 { workingTime:
   [ { name: 'sally',
       number_of_time_units: 10,
       time_units: 'weekConcept' } ] }
Logs
    Context for choosing the operator ('weekConcept', 0) was [('count', 0), ('personConcept', 0), ('weekConcept', 0), ('worked', 0)]
    Context for choosing the operator ('personConcept', 0) was [('count', 0), ('personConcept', 0), ('worked', 0)]
    Context for choosing the operator ('count', 0) was [('count', 0), ('worked', 0)]
    Context for choosing the operator ('worked', 0) was [('worked', 0)]
    Op choices were: [('weekConcept', 0), ('personConcept', 0), ('count', 0), ('worked', 0)]
[ [ 'sally worked 10 weeks' ] ]

*/

const entodicton = require('entodicton')

let config = {
  operators: [
    '(([personConcept]) [earn|earns] ((<count> ([dollarConcept])) [every] ([weekConcept])))',
    '(([personConcept]) [worked] (<count> ([weekConcept|weeks])))'
  ],
  bridges: [
    { "id": "count", "level": 0, "bridge": "{ ...operator, ...after, number: operator.value }" },

    { "id": "weekConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "dollarConcept", "level": 0, "bridge": "{ ...next(operator) }" },
    { "id": "personConcept", "level": 0, "bridge": "{ ...next(operator) }" },

    { "id": "every", "level": 0, "bridge": "{ marker: 'dollarConcept', units: 'dollars', amount: before.value, duration: 'week' }" },

    { "id": "earn", "level": 0, "bridge": "{ marker: 'earn', units: 'dollars', amount: after.amount, who: before.id, period: after.duration }" },
    { "id": "worked", "level": 0, "bridge": "{ marker: 'worked', who: before.id, duration: after.number, units: after.marker }" },
  ],
  priorities: [
  ],
  "version": '3',
  "words": {
    " ([0-9]+)": [{"id": "count", "initial": "{ value: int(group[0]) }" }],
    "week": [{"id": "weekConcept", 'initial': { 'language': 'english' } }],
    "dollars": [{"id": "dollarConcept", 'initial': { 'language': 'english' } }],
    "joe": [{"id": "personConcept", 'initial': { 'id': 'joe' } }],
    "sally": [{"id": "personConcept", 'initial': { 'id': 'sally' } }],
    "per": [{"id": "every"}],
  },

  generators: [
    [ ({context}) => context.marker == 'earn', ({g, context}) => `${g(context.who)} earns ${g(context.amount)} ${g(context.units)} per ${context.period}` ],
    [ ({context}) => context.marker == 'weekConcept' && context.duration == 1, ({g, context}) => `${context.duration} week` ],
    [ ({context}) => context.marker == 'weekConcept' && context.duration > 1, ({g, context}) => `${context.duration} weeks` ],
    [ ({context}) => context.marker == 'worked', ({g, context}) => `${g(context.who)} worked ${ g({ marker: context.units, duration: context.duration}) }` ],
    [ ({context}) => context.marker == 'response', ({g, context}) => `${context.who} earned ${context.earnings} ${context.units}` ],
  ],

  semantics: [
    [({objects, context}) => context.marker == 'earn', ({objects, context}) => {
      if (! objects.employees ) {
        objects.employees = []
      }
      objects.employees.push({ name: context.who, earnings_per_period: context.amount, period: context.period, units: 'dollars' })
     }],
    [({objects, context}) => context.marker == 'worked', ({objects, context}) => {
      if (! objects.workingTime ) {
        objects.workingTime = []
      }
      objects.workingTime.push({ name: context.who, number_of_time_units: context.duration, time_units: context.units })
     }],
  ],
};

url = process.argv[2] || "http://184.67.27.82"
key = process.argv[3] || "6804954f-e56d-471f-bbb8-08e3c54d9321"

const query = 'sally worked 10 weeks'
console.log(`Running the input: ${query}`);
config.objects = {}
config = new entodicton.Config(config)
config.server(url, key)
config.process(query)
  .then( (responses) => {
    if (responses.errors) {
      console.log('Errors')
      responses.errors.forEach( (error) => console.log(`    ${error}`) )
    }
    console.log('This is the objects from running semantics:\n', config.objects)
    if (responses.logs) {
      console.log('Logs')
      responses.logs.forEach( (log) => console.log(`    ${log}`) )
    }
    console.log(responses.generated);
  })
  .catch( (error) => {
    console.log(`Error ${query}`);
    console.log(error)
  })
