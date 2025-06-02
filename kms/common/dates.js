const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dates_tests = require('./dates.test.json')
const dates_instance = require('./dates.instance.json')
const hierarchy = require('./hierarchy')
const helpers = require('./helpers')

/*
  january 10 1990
*/
const template = {
  configs: [
    "setidsuffix _dates",
    "january, february, march, april, may, june, july, august, september, october, november and december are months",
    "monday, tuesday, wednesday, thursday, friday, saturday and sunday are days",
    {
      operators: [
        "([dayNumber_dates|])",
        "([yearNumber_dates|])",
        "([monthNumber_dates|])",
        "([dateSeparator_dates|])",
        "([monthDayYear_dates] (month_dates/*) (dayNumber_dates/*) (yearNumber_dates/*))",
        "([monthDayYearWithSlashes_dates] (monthNumber_dates/*) (dateSeparator_dates/*) (dayNumber_dates/*) (dateSeparator_dates/*) (yearNumber_dates/*))",
      ],
      bridges: [
        { 
          id: 'dateSeparator_dates', 
          words: ['/'],
          bridge: "{ ...next(operator) }" 
        },
        { 
          id: 'monthDayYearWithSlashes_dates', 
          convolution: true,
          bridge: "{ ...next(operator), day: after[2], month: after[0], year: after[4], interpolate: '${month}/${day}/${year}' }",
        },
        { id: 'dayNumber_dates', bridge: "{ ...next(operator) }" },
        { 
          id: 'monthNumber_dates', 
          bridge: "{ ...next(operator) }" 
        },
        { id: 'yearNumber_dates', bridge: "{ ...next(operator) }" },
        { 
          id: 'monthDayYear_dates', 
          convolution: true,
          bridge: "{ ...next(operator), month: after[0], day: after[1], year: after[2], generate: ['month', 'day', 'year'] }"
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
    "resetIdSuffix",
  ],
}

knowledgeModule( { 
  config: { name: 'dates' },
  includes: [hierarchy],

  module,
  description: 'talking about dates',
  test: {
    name: './dates.test.json',
    contents: dates_tests,
    checks: {
      context: defaultContextCheck(),
    },
  },
  template: {
    template,
    instance: dates_instance,
  },

})
