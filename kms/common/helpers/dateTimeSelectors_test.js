const { instantiate, until } = require('./dateTimeSelectors');

/*
const date = new Date('2025-07-28T14:54:00-07:00');

// Convert to ISO 8601 string (UTC)
const isoString = date.toISOString();
console.log(isoString); // "2025-07-28T21:54:00.000Z"
*/

const isA = (child, parent) => {
  return child == parent
}

describe("instantiate", () => {
  test('NEOS23 monday', () => {
    const monday = {
      "context_id": 2,
      "context_index": 1,
      "dead": true,
      "level": 1,
      "marker": "monday_dates",
      "number": "one",
      "range": {
        "end": 5,
        "start": 0
      },
      "text": "monday",
      "topLevel": true,
      "value": "monday_dates",
      "word": "monday"
    }
    monday.dayOfWeek = true

    const now = new Date(2025, 6, 29, 14, 52, 0);
    const actual = instantiate(isA, now, { dateTimeSelector: monday })
    const expected = new Date('2025-08-04T21:52:00.000Z');
    expect(actual).toStrictEqual(expected.toISOString()) 
  });

  const dateTimeSelectorWithExplicitOn = (ampm) => {
    return {
      "marker": "dateTimeSelector",
      "range": {
        "start": 26,
        "end": 43
      },
      "dead": true,
      "date": {
        "marker": "onDate_dates",
        "default": true,
        "word": "on",
        "text": "on monday",
        "range": {
          "start": 26,
          "end": 34
        },
        "dead": true,
        "date": {
          "value": "monday_dates",
          "number": "one",
          "text": "monday",
          "marker": "monday_dates",
          "word": "monday",
          "range": {
            "start": 29,
            "end": 34
          },
          "dead": true,
          "types": [
            "monday_dates"
          ],
          "level": 1
        },
        "onDate": {
          "marker": "onDate_dates",
          "default": true,
          "word": "on",
          "text": "on",
          "range": {
            "start": 26,
            "end": 27
          },
          "level": 0
        },
        "interpolate": "${onDate} ${date}",
        "level": 1
      },
      "time": {
        "marker": "atTime",
        "default": true,
        "word": "at",
        "text": `at 10 ${ampm}`,
        "range": {
          "start": 36,
          "end": 43
        },
        "dead": true,
        "time": {
          "instance": true,
          "value": 10,
          "text": `10 ${ampm}`,
          "marker": "time",
          "word": "10",
          "range": {
            "start": 39,
            "end": 43
          },
          "dead": true,
          "types": [
            "time"
          ],
          "ampm": {
            "ampm": ampm,
            "determined": true,
            "text": ampm,
            "marker": "ampm",
            "word": ampm,
            "range": {
              "start": 42,
              "end": 43
            },
            "level": 0
          },
          "time": {
            "instance": true,
            "value": 10,
            "text": "10",
            "marker": "integer",
            "word": "10",
            "range": {
              "start": 39,
              "end": 40
            },
            "dead": true,
            "types": [
              "integer",
              "time"
            ],
            "level": 1
          },
          "interpolate": "${time} ${ampm}",
          "level": 0
        },
        "operator": {
          "marker": "atTime",
          "default": true,
          "word": "at",
          "text": "at",
          "range": {
            "start": 36,
            "end": 37
          },
          "level": 0
        },
        "interpolate": "${operator} ${time}",
        "types": [
          "atTime"
        ],
        "level": 1
      },
      "interpolate": "${date} ${time}",
      "text": ` on monday at 10 ${ampm}`,
      "types": [
        "dateTimeSelector"
      ],
      "level": 1,
      "evaluate": true
    }
  }

  test('NEOS23 date with time am', () => {
    const now = new Date(2025, 6, 29, 14, 52, 0);
    const actual = instantiate(isA, now, dateTimeSelectorWithExplicitOn('am'))
    const expected = new Date("2025-08-04T17:00:00.000Z");
    expect(actual).toStrictEqual(expected.toISOString()) 
  });

  test('NEOS23 date with time pm', () => {
    const now = new Date(2025, 6, 29, 14, 52, 0);
    const actual = instantiate(isA, now, dateTimeSelectorWithExplicitOn('pm'))
    const expected = new Date("2025-08-05T05:00:00.000Z");
    expect(actual).toStrictEqual(expected.toISOString()) 
  });

  const dateTimeSelectorWithImplicitOn = (ampm) => {
    return {
      "marker": "dateTimeSelector",
      "range": {
        "start": 26,
        "end": 43
      },
      "dead": true,
      "date": {
        "value": "monday_dates",
        "number": "one",
        "text": "monday",
        "marker": "monday_dates",
        "word": "monday",
        "range": {
          "start": 29,
          "end": 34
        },
        "dead": true,
        "types": [
          "monday_dates"
        ],
        "level": 1
      },
      "time": {
        "marker": "atTime",
        "default": true,
        "word": "at",
        "text": `at 10 ${ampm}`,
        "range": {
          "start": 36,
          "end": 43
        },
        "dead": true,
        "time": {
          "instance": true,
          "value": 10,
          "text": `10 ${ampm}`,
          "marker": "time",
          "word": "10",
          "range": {
            "start": 39,
            "end": 43
          },
          "dead": true,
          "types": [
            "time"
          ],
          "ampm": {
            "ampm": ampm,
            "determined": true,
            "text": ampm,
            "marker": "ampm",
            "word": ampm,
            "range": {
              "start": 42,
              "end": 43
            },
            "level": 0
          },
          "time": {
            "instance": true,
            "value": 10,
            "text": "10",
            "marker": "integer",
            "word": "10",
            "range": {
              "start": 39,
              "end": 40
            },
            "dead": true,
            "types": [
              "integer",
              "time"
            ],
            "level": 1
          },
          "interpolate": "${time} ${ampm}",
          "level": 0
        },
        "operator": {
          "marker": "atTime",
          "default": true,
          "word": "at",
          "text": "at",
          "range": {
            "start": 36,
            "end": 37
          },
          "level": 0
        },
        "interpolate": "${operator} ${time}",
        "types": [
          "atTime"
        ],
        "level": 1
      },
      "interpolate": "${date} ${time}",
      "text": ` on monday at 10 ${ampm}`,
      "types": [
        "dateTimeSelector"
      ],
      "level": 1,
      "evaluate": true
    }
  }

  test('NEOS23 date with time am with implicit on', () => {
    const now = new Date(2025, 6, 29, 14, 52, 0);
    const actual = instantiate(isA, now, dateTimeSelectorWithImplicitOn('am'))
    const expected = new Date("2025-08-04T17:00:00.000Z");
    expect(actual).toStrictEqual(expected.toISOString()) 
  });

  test('NEOS23 date with time pm', () => {
    const now = new Date(2025, 6, 29, 14, 52, 0);
    const actual = instantiate(isA, now, dateTimeSelectorWithImplicitOn('pm'))
    const expected = new Date("2025-08-05T05:00:00.000Z");
    expect(actual).toStrictEqual(expected.toISOString()) 
  });

});

