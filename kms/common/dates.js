const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck, defaultContextCheckProperties } = require('./helpers')
const dates_tests = require('./dates.test.json')
const dates_instance = require('./dates.instance.json')
const hierarchy = require('./hierarchy')
const ordinals = require('./ordinals')
const helpers = require('./helpers')

/*
  january 10 1990
  january 1990
  january 20th
*/
const template = {
  configs: [
    "setidsuffix _dates",
    ({config}) => {
      const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
      config.addSemantic({
        match: ({context}) => {
          if (!context.makeObject) {
            return
          }
          return months.includes(context.value)
        },
        apply: ({context}) => {
          context.initial.month_ordinal = months.findIndex((month) => month == context.value) + 1
        },
      })
    },
    "january, february, march, april, may, june, july, august, september, october, november and december are months",
    ({config}) => {
      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
      config.addSemantic({
        match: ({context}) => {
          if (!context.makeObject) {
            return
          }
          return days.includes(context.value)
        },
        apply: ({context}) => {
          context.initial.day_ordinal = days.findIndex((day) => day == context.value) + 1
        },
      })
    },
    "monday, tuesday, wednesday, thursday, friday, saturday and sunday are days",
    "ac, bc, bce and ad are eras",
    // "ac, bc,, bce,, and ad are eras",
    /*
    "bc and bce mean the same thing",
    "ad is a synonym for ce",
    "bc stands for before christ",
    "ad synonym for anno domino",
    "bce stands for before common era",
    "ce is an abbreviation of common era",
    "use ce and bce",
    "use bc and ad",
    */
    {
      operators: [
        "([dayNumber_dates|])",
        "([yearNumber_dates|])",
        "([monthNumber_dates|])",
        "([dateSeparator_dates|])",
        "([era_dates|])",
        "([date_dates|])",
        "([dateEra_dates] (date_dates/*) (era_dates/*))",
        "([monthDay_dates] (month_dates/*) (dayNumber_dates/*))",
        "([monthYear_dates] (month_dates/*) (yearNumber_dates/*))",
        "([monthDayYear_dates] (month_dates/*) (dayNumber_dates/*) (yearNumber_dates/*))",
        "([monthDayYearWithSlashes_dates] (monthNumber_dates/*) (dateSeparator_dates/*) (dayNumber_dates/*) (dateSeparator_dates/*) (yearNumber_dates/*))",
        "([onDate_dates|on] ([onDateValue_dates|]))",
        "([afterDate_dates|after] ([afterDateValue_dates|]))",
      ],
      associations: {
        positive: [
          { context: [['every', 0], ['monday_dates', 0]], choose: 1 },
        ]
      },
      hierarchy: [
        ['monday_dates', 'distributable'],
      ],
      bridges: [
        {
          id: 'onDateValue_dates',
          children: [
            'day_dates',
            'month_dates',
          ],
        },
        {
          id: 'onDate_dates',
          isA: ['preposition'],
          bridge: "{ ...next(operator), date: after[0], onDate: operator, interpolate: '${onDate} ${date}' }",
          check: defaultContextCheckProperties(['onDate', 'date']),
        },
        {
          id: 'afterDateValue_dates',
          children: [
            'day_dates',
            'month_dates',
          ],
        },
        {
          id: 'afterDate_dates',
          isA: ['preposition'],
          bridge: "{ ...next(operator), date: after[0], afterDate: operator, interpolate: '${afterDate} ${date}' }",
          check: defaultContextCheckProperties(['afterDate', 'date']),
        },
        { 
          id: 'era_dates', 
          words: ['era'],
          bridge: "{ ...next(operator) }" 
        },
        { 
          id: 'date_dates', 
          words: ['date', 'distributable'],
          isA: ['onDateValue_dates', 'afterDateValue_dates'],
          bridge: "{ ...next(operator) }" 
        },
        { 
          id: 'dateEra_dates', 
          isA: ['date_dates'],
          convolution: true,
          bridge: "{ ...next(after[0]), era: after[1], interpolate: concat(after[0].interpolate, ' ${era}') }",
          check: defaultContextCheckProperties(['era']),
        },
        { 
          id: 'dateSeparator_dates', 
          words: ['/'],
          bridge: "{ ...next(operator) }" 
        },
        { 
          id: 'monthDayYearWithSlashes_dates', 
          isA: ['date_dates'],
          before: ['preposition'],
          separators: "||||",
          convolution: true,
          bridge: "{ ...next(operator), day: after[2], month: after[0], year: after[4], interpolate: '${month}/${day}/${year}' }",
          check: defaultContextCheckProperties(['day', 'month', 'year']),
        },
        { 
          id: 'dayNumber_dates', 
          isA: ['integer'],
          //associations: ['dates'],
          bridge: "{ ...next(operator) }" 
        },
        { 
          id: 'monthNumber_dates', 
          isA: ['integer'],
          bridge: "{ ...next(operator) }" 
        },
        { 
          id: 'yearNumber_dates', 
          isA: ['integer'],
          bridge: "{ ...next(operator) }" 
        },
        { 
          id: 'monthDay_dates', 
          convolution: true,
          localHierarchy: [['ordinal', 'dayNumber_dates']],
          before: ['preposition'],
          isA: ['date_dates'],
          bridge: "{ ...next(operator), month: after[0], day: after[1], interpolate: '${month} ${day}' }",
          check: defaultContextCheckProperties(['day', 'month']),
        },
        { 
          id: 'monthYear_dates', 
          convolution: true,
          before: ['preposition'],
          isA: ['date_dates'],
          bridge: "{ ...next(operator), month: after[0], year: after[1], interpolate: '${month} ${year}' }",
          check: defaultContextCheckProperties(['month', 'year']),
        },
        { 
          id: 'monthDayYear_dates', 
          convolution: true,
          before: ['preposition', 'monthDay_dates'],
          isA: ['date_dates'],
          evaluator: ({context}) => {
            const year = context.year.value
            const day = context.day.value
            const month_ordinal = context.month.month_ordinal
            context.evalue = new Date(year, month_ordinal-1, day).toISOString()
          },
          localHierarchy: [
            ['ordinal', 'dayNumber_dates'],
          ],
          bridge: "{ ...next(operator), month: after[0], day: after[1], year: after[2], interpolate: '${month} ${day} ${year}' }",
          check: defaultContextCheckProperties(['month', 'day', 'year']),
        },
      ],
      words: {
        patterns: [
          {
            pattern: [{ type: 'digit' }, { repeat: true }],
            allow_partial_matches: false,
            defs: [{id: "dayNumber_dates", uuid: '1', initial: "{ value: int(text), instance: true }" }]
          },
          {
            pattern: [{ type: 'digit' }, { repeat: true }],
            allow_partial_matches: false,
            defs: [{id: "monthNumber_dates", uuid: '1', initial: "{ value: int(text), instance: true }" }]
          },
          {
            pattern: [{ type: 'digit' }, { repeat: true }],
            allow_partial_matches: false,
            defs: [{id: "yearNumber_dates", uuid: '1', initial: "{ value: int(text), instance: true }" }]
          },
        ],
      }
    },
    (args) => {
      {
        const as = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec']
        const ms = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
        // args.makeObject({...args, context: { word: as[i], value: `${ms[i]}_dates`}, types: [`${ms[i]}_dates`]})
        for (let i = 0; i < as.length; ++i) {
          const word = as[i]
          if (word == 'may') {
            continue
          }
          const id = `${ms[i]}_dates`
          args.addWords(id, word, { value: id, abbreviation: word, month_ordinal: i+1 })
        }
      }

      {
        const as = ['sun', 'mon', 'tues', 'weds', 'thurs', 'fri', 'sat']
        const ms = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        // args.makeObject({...args, context: { word: as[i], value: `${ms[i]}_dates`}, types: [`${ms[i]}_dates`]})
        for (let i = 0; i < as.length; ++i) {
          const word = as[i]
          const id = `${ms[i]}_dates`
          args.addWords(id, word, { value: id, abbreviation: word, day_ordinal: i+1 })
        }
      }

    },
    "resetIdSuffix",
  ],
}

knowledgeModule( { 
  config: { name: 'dates' },
  includes: [ordinals, hierarchy],

  module,
  description: 'talking about dates',
  test: {
    name: './dates.test.json',
    contents: dates_tests,
    checks: {
      context: [
//        defaultContextCheck({ marker: 'monthDayYear_dates', exported: true, extra: ['month', 'day', 'year'] }),
        defaultContextCheck({ extra: ['month', 'day', 'year', 'era', 'month_ordinal', 'day_ordinal', 'month', 'date'] }),
      ],
    }
  },
  template: {
    template,
    instance: dates_instance,
  },

})
