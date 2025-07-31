const { instantiate, until } = require('./dateTimeSelectors');

/*
const date = new Date('2025-07-28T14:54:00-07:00');

// Convert to ISO 8601 string (UTC)
const isoString = date.toISOString();
console.log(isoString); // "2025-07-28T21:54:00.000Z"
*/

describe("instantiate", () => {
  test('NEO23 monday', () => {
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
    const actual = instantiate(now, { dateTimeSelector: monday })
    const expected = new Date('2025-08-04T21:52:00.000Z');
    expect(actual).toStrictEqual(expected.toISOString()) 
  });

});

