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
   2 sundays from last tuesday
   the sunday after july 1st
   the first tuesday after july 1st
   the first tuesday on or after july 1st
   the last tuesday of every month
   the last tuesday of every third month
   monday at 10 am
   10 am
   first monday after jan 1
*/

function instantiate(kms, isA, isProcessOrTest, dateTimeSelector) {
  try {
    const now = kms.time.api.now()
    return dateTimeSelectors_helpers.instantiate(isA, now, dateTimeSelector)
  } catch ( e ) {
    return `Implement instatiate for this type of date. See the dateTimeSelectors KM ${where()}`
  }
}

const template = {
  configs: [
    { 
      operators: [
        "([dateTimeSelector] (onDate) (atTime))",
        "((day_dates/*) [dayOfMonth|of] (month_dates/*))",
      ],
      bridges: [
        { 
          id: 'dayOfMonth', 
          after: ['preposition'],
          before: ['verb'],
          bridge: "{ ...next(operator), day: before[0], month: after[0], operator: operator, interpolate: '${day} ${operator} ${month}' }",
        },
        { 
          id: 'dateTimeSelector', 
          after: ['preposition'],
          before: ['verb'],
          convolution: true,
          children: ['onDate_dates', 'atTime', 'date_dates'],
          bridge: "{ ...next(operator), date: after[0], time: after[1], interpolate: '${date} ${time}' }",
        },
      ],
      semantics: [
        {
          match: ({context, isA}) => {
            if (!context.evaluate) {
              return false
            }
            if (isA(context.marker, 'onDateValue_dates')) {
              return true
            }
            if (isA(context.marker, 'dateTimeSelector')) {
              return true
            }
          },
          apply: ({context, isProcess, isTest, kms, isA}) => {
            context.evalue = instantiate(kms, isA, isProcess || isTest || context.isTest, context)
          },
        }
      ],
      hierarchy: [
        ['day_dates', 'orderable'],
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
