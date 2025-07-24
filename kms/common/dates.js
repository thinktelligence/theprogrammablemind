const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
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
    "january, february, march, april, may, june, july, august, september, october, november and december are months",
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
        "([monthYear_dates] (month_dates/*) (yearNumber_dates/*))",
        "([monthDayYear_dates] (month_dates/*) (dayNumber_dates/*) (yearNumber_dates/*))",
        "([monthDayYearWithSlashes_dates] (monthNumber_dates/*) (dateSeparator_dates/*) (dayNumber_dates/*) (dateSeparator_dates/*) (yearNumber_dates/*))",
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
          id: 'era_dates', 
          words: ['era'],
          bridge: "{ ...next(operator) }" 
        },
        { 
          id: 'date_dates', 
          words: ['date', 'distributable'],
          bridge: "{ ...next(operator) }" 
        },
        { 
          id: 'dateEra_dates', 
          isA: ['date_dates'],
          convolution: true,
          bridge: "{ ...next(after[0]), era: after[1], interpolate: concat(after[0].interpolate, ' ${era}') }" 
        },
        { 
          id: 'dateSeparator_dates', 
          words: ['/'],
          bridge: "{ ...next(operator) }" 
        },
        { 
          id: 'monthDayYearWithSlashes_dates', 
          isA: ['date_dates'],
          convolution: true,
          bridge: "{ ...next(operator), day: after[2], month: after[0], year: after[4], interpolate: '${month}/${day}/${year}' }",
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
          id: 'monthYear_dates', 
          convolution: true,
          isA: ['date_dates'],
          bridge: "{ ...next(operator), month: after[0], year: after[1], interpolate: '${month} ${year}' }"
        },
        { 
          id: 'monthDayYear_dates', 
          convolution: true,
          isA: ['date_dates'],
          localHierarchy: [
            ['ordinal', 'dayNumber_dates'],
          ],
          bridge: "{ ...next(operator), month: after[0], day: after[1], year: after[2], interpolate: '${month} ${day} ${year}' }"
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
      const as = ['jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec']
      const ms = ['january', 'february', 'march', 'april', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
      for (let i = 0; i < as.length; ++i) {
        args.makeObject({...args, context: { word: as[i], value: `${as[i]}_dates`}, types: [`${ms[i]}_dates`]})
      }

      /*
      const word = 'bc'
      const synonym = 'bce'
      args.makeObject({...args, context: { word: synonym, value: `${synonym}_dates`}, types: [`${word}_dates`]})
      */
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
      context: defaultContextCheck(['day', 'month', 'year', 'era']),
    },
  },
  template: {
    template,
    instance: dates_instance,
  },

})
