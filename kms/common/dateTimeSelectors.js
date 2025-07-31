const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dateTimeSelectors_tests = require('./dateTimeSelectors.test.json')
const dateTimeSelectors_instance = require('./dateTimeSelectors.instance.json')
const dates = require('./dates')
const time = require('./time')
const dateTimeSelectors_helpers = require('./helpers/dateTimeSelectors')

/*
   friday instead
   change it to friday
   delete it
   make it friday instead
   2 sundays from now
   the sunday after july 1st
*/

function instantiate(isProcess, dateTimeSelector) {
  let now;
  if (isProcess) {
    // so the unit tests work consistently
    now = new Date(2025, 6, 29, 14, 52, 0)
  } else {
    now = new Date()
  }
  // reminder.nextISODate = dateTimeSelectors_helpers.instantiate(now, reminder)
  return dateTimeSelectors_helpers.instantiate(now, dateTimeSelector)
}

const template = {
  configs: [
    { 
      operators: [
        "([dateTimeSelector] (onDate) (atTime))",
      ],
      bridges: [
        { 
          id: 'dateTimeSelector', 
          after: ['preposition'],
          before: ['verb'],
          convolution: true,
          children: ['onDate_dates', 'atTime', 'date_dates'],
          bridge: "{ ...next(operator), date: after[0], time: after[1], interpolate: '${date} ${time}' }",
          /*
          evaluator: {
            match: ({context, isA}) => isA(context.marker, 'dateTimeSelector'),
            apply: ({context, isProcess}) => {
              debugger
              context.evalue = instantiate(isProcess, context)
            },
          }
          */
        },
      ],
      semantics: [
        {
          match: ({context, isA}) => isA(context.marker, 'dateTimeSelector') && !!args.context.evaluate,
          apply: ({context, isProcess}) => {
            context.evalue = instantiate(isProcess, context)
          },
        }
      ],
    },
  ],
}

knowledgeModule( { 
  config: { name: 'dateTimeSelectors' },
  includes: [time, dates],

  module,
  description: 'talking about date and time selectors',
  test: {
    name: './dateTimeSelectors.test.json',
    contents: dateTimeSelectors_tests,
    checks: {
      context: defaultContextCheck([
        'date', 'time', 'response',
        {
          value: {
            date: 'defaults',
            time: 'defaults',
            evalue: 'defaults'
          },
        }
      ]),
    },
  },
  template: {
    template,
    instance: dateTimeSelectors_instance,
  },

})
