const _ = require('lodash')
const { flattenInPlace } = require('./flatten_in_place')

const the_gender_and_birth_date = {
  "marker": "list",
  "default": true,
  "word": "and",
  "text": "the gender and birth date",
  "range": {
    "start": 8,
    "end": 32
  },
  "types": [
    "birth_dates_date_dates",
    "gender",
    "list"
  ],
  "listable": true,
  "isList": true,
  "value": [
    {
      "value": "gender",
      "number": "one",
      "text": "gender",
      "marker": "gender",
      "word": "gender",
      "range": {
        "start": 12,
        "end": 17
      },
      "dead": true,
      "level": 0
    },
    {
      "value": "birth_dates_date_dates",
      "text": "birth date",
      "marker": "birth_dates_date_dates",
      "word": "date",
      "range": {
        "start": 23,
        "end": 32
      },
      "types": [
        "birth_dates_date_dates",
        "date_dates"
      ],
      "modifier_birth_dates": {
        "value": "birth_dates",
        "number": "one",
        "text": "birth",
        "marker": "birth_dates",
        "word": "birth",
        "range": {
          "start": 23,
          "end": 27
        },
        "types": [
          "birth_dates"
        ],
        "level": 0
      },
      "atomic": true,
      "dead": true,
      "compatible_types": [
        "date_dates"
      ],
      "modifiers": [
        "modifier_birth_dates"
      ],
      "level": 0
    }
  ],
  "focusableForPhrase": true,
  "pullFromContext": true,
  "concept": true,
  "wantsValue": true,
  "checks": [
    "determiner"
  ],
  "determiner": {
    "modifiers": [],
    "text": "the",
    "marker": "the",
    "word": "the",
    "range": {
      "start": 8,
      "end": 10
    },
    "level": 0
  },
  "theable": {
    "marker": "list",
    "default": true,
    "word": "and",
    "text": "gender and birth date",
    "range": {
      "start": 12,
      "end": 32
    },
    "types": [
      "birth_dates_date_dates",
      "gender",
      "list"
    ],
    "listable": true,
    "isList": true,
    "value": [
      {
        "value": "gender",
        "number": "one",
        "text": "gender",
        "marker": "gender",
        "word": "gender",
        "range": {
          "start": 12,
          "end": 17
        },
        "dead": true,
        "level": 0
      },
      {
        "value": "birth_dates_date_dates",
        "text": "birth date",
        "marker": "birth_dates_date_dates",
        "word": "date",
        "range": {
          "start": 23,
          "end": 32
        },
        "types": [
          "birth_dates_date_dates",
          "date_dates"
        ],
        "modifier_birth_dates": {
          "value": "birth_dates",
          "number": "one",
          "text": "birth",
          "marker": "birth_dates",
          "word": "birth",
          "range": {
            "start": 23,
            "end": 27
          },
          "types": [
            "birth_dates"
          ],
          "level": 0
        },
        "atomic": true,
        "dead": true,
        "compatible_types": [
          "date_dates"
        ],
        "modifiers": [
          "modifier_birth_dates"
        ],
        "level": 0
      }
    ],
    "level": 1
  },
  "flatten_ignore": [
    "theable"
  ],
  "interpolate": [
    {
      "property": "determiner"
    },
    {
      "property": "theable"
    }
  ],
  "level": 1
}

describe('flattenInPlace', () => {
  it('NEOS23 noop', () => {
    const context = {}
    const actual = flattenInPlace(context)
    expect(actual).toStrictEqual([context])
  })

  it('NEO23 the_gender_and_birth_date', () => {
    const context = the_gender_and_birth_date
    const gender = {...context}
    gender.value = context.value[0]
    Object.assign(gender, context.value[0])
    gender.value = context.value[0].value
    gender.theable = context.theable.value[0]
    gender.listable = undefined
    gender.isList = undefined
    gender.types = context.theable.value[0].types
    const birth_date = {...context}
    Object.assign(birth_date, context.value[1])
    birth_date.value = context.value[1].value
    birth_date.theable = context.theable.value[1]
    birth_date.listable = undefined
    birth_date.isList = undefined
    debugger
    birth_date.types = context.theable.value[1].types
    console.log(JSON.stringify(gender, null, 2))
    const actual = flattenInPlace(['list'], context)
    expect(actual).toStrictEqual([gender, birth_date])
  })
})
