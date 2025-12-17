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
    return `Implement instatiate for this type of date, ${dateTimeSelector.marker}. See the dateTimeSelectors KM ${where()}, ${e}\n${e.stack}`
  }
}

function removeDatesSuffix(str) {
  if (str.endsWith('_dates')) {
    return str.slice(0, -6); // Removes last 6 characters
  }
  return str;
}

function onOrIs(marker, context) {
  if (context.marker === marker) {
    return context
  }
  if (context.marker === 'onDate_dates' && context.date?.marker == marker) {
    return context.date
  }
}

function afterOrIs(marker, context) {
  if (context.marker === marker) {
    return context
  }
  if (context.marker === 'onDate_dates' && context.date?.marker == marker) {
    return context.date
  }
}

const template = {
  configs: [
    { 
      operators: [
        "([dateTimeSelector] (onDate) (atTime))",
        "((day_dates/*) [dayOfMonth|of] (month_dates/*))",
        "((day_dates/*) [dayAfterDate|after] (afterDateValue_dates/*))",
      ],
      bridges: [
        { 
          id: 'dayOfMonth', 
          after: ['article'],
          isA: ['onDateValue_dates'],
          before: ['verb', 'onDate_dates'],
          bridge: "{ ...next(operator), day: before[0], month: after[0], operator: operator, interpolate: '${day} ${operator} ${month}' }",
          check: ['day', 'month'],
        },
        { 
          id: 'dayAfterDate', 
          after: ['article', 'monthDayYear_dates'],
          isA: ['onDateValue_dates'],
          before: ['verb', 'afterDate_dates'],
          bridge: "{ ...next(operator), day: before[0], after: after[0], operator: operator, interpolate: '${day} ${operator} ${after}' }",
          check: ['day', 'after'],
        },
        { 
          id: 'dateTimeSelector', 
          after: ['preposition'],
          before: ['verb'],
          convolution: true,
          children: ['onDate_dates', 'atTime', 'date_dates'],
          bridge: "{ ...next(operator), date: after[0], time: after[1], interpolate: '${date} ${time}' }",
          check: ['time', 'date'],
        },
      ],
      semantics: [
        {
          match: ({context, isA}) => context.evaluate && onOrIs('dayAfterDate', context),
          apply: async ({context, isProcess, isTest, kms, isA, e}) => {
            try {
              const now = kms.time.api.now()
              const date = afterOrIs('dayAfterDate', context)
              const afterISO = (await e(date.after)).evalue
              const day_ordinal = date.day.day_ordinal
              const ordinal = date.day.ordinal.value
              context.evalue = dateTimeSelectors_helpers.getNthWeekdayAfterDate(afterISO, day_ordinal, ordinal)
            } catch ( e ) {
              context.evalue = `Implement instatiate for this type of date, ${context.marker}. See the dateTimeSelectors KM ${where()}. ${e}`
            }
          },
        },
        {
          match: ({context, isA}) => context.evaluate && onOrIs('dayOfMonth', context),
          apply: ({context, isProcess, isTest, kms, isA}) => {
            try {
              const now = kms.time.api.now()
              const date = onOrIs('dayOfMonth', context)
              context.evalue = dateTimeSelectors_helpers.getNthDayOfMonth(removeDatesSuffix(date.day.value), date.day.ordinal.value || 1, removeDatesSuffix(date.month.value), now)
            } catch ( e ) {
              context.evalue = `Implement instatiate for this type of date, ${context.marker}. See the dateTimeSelectors KM ${where()}. ${e}`
            }
          },
        },
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
      context: [
        // defaultContextCheck({ extra: ['date', 'time', 'response', 'after', 'day', 'month', 'year', 'evalue'] }),
        defaultContextCheck({ extra: ['date', 'time', 'response', 'after', 'evalue'] }),
      ],
    }
  },
  template: {
    template,
    instance: dateTimeSelectors_instance,
  },

})
