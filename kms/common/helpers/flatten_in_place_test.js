const _ = require('lodash')
const { flattenInPlace } = require('./flatten_in_place')

const one_list = {
  marker: "list",
  flattenInPlaceRemove: ['isList', 'value'],
  flattenInPlace: [['value']],
  isList: true,
  value: [
    {
      "marker": "gender",
      "other": 23,
    },
    {
      "marker": "birth_dates_date_dates",
      "other": 24,
    }
  ],
}
const one_list_expected = [
  { "marker": "gender", other: 23, },
  { "marker": "birth_dates_date_dates", other: 24 },
]

const one_list_with_other_prop = {
  marker: "list",
  flattenInPlaceRemove: ['isList', 'value'],
  flattenInPlace: [['value', 'property']],
  isList: true,
  value: [
    {
      "marker": "gender", 
      other: 27,
    },
    {
      "marker": "birth_dates_date_dates",
      other: 28,
    }
  ],
  property: {
    marker: "list",
    flattenInPlaceRemove: ['isList', 'value'],
    flattenInPlace: [['value']],
    isList: true,
    value: [
      {
        "marker": "gender",
        inner: 44,
      },
      {
        "marker": "birth_dates_date_dates",
        inner: 45,
      }
    ],
  }
}

const one_list_with_other_prop_expected = [
  {
    "marker": "gender",
    other: 27,
    "property": {
      "marker": "gender",
      inner: 44,
    }
  },
  {
    "marker": "birth_dates_date_dates",
    other: 28,
    "property": {
      "marker": "birth_dates_date_dates",
      inner: 45,
    }
  }
]

const one_list_with_other_prop_containing_list = {
  marker: "list",
  flattenInPlaceRemove: ['isList', 'value'],
  flattenInPlace: [['value', 'property']],
  isList: true,
  value: [
    {
      "marker": "gender",
      one: 23,
    },
    {
      "marker": "birth_dates_date_dates",
      one: 24,
    }
  ],
  property: {
    marker: "list",
    flattenInPlaceRemove: ['isList', 'value'],
    flattenInPlace: [['value', 'theable']],
    isList: true,
    value: [
      {
        "marker": "gender",
        two: 23,
      },
      {
        "marker": "birth_dates_date_dates",
        two: 24,
      }
    ],
    theable: {
      marker: "list",
      flattenInPlaceRemove: ['isList', 'value'],
      flattenInPlace: [['value']],
      isList: true,
      value: [
        {
          "marker": "gender",
          three: 24,
        },
        {
          "marker": "birth_dates_date_dates",
          three: 28,
        }
      ],
    }
  }
}

const one_list_with_other_prop_containing_list_expected = [
  {
    marker: "gender",
    one: 23,
    property: {
      marker: "gender",
      two: 23,
      theable: {
        marker: "gender",
        three: 24,
      }
    }
  },
  {
    marker: "birth_dates_date_dates",
    one: 24,
    property: {
      marker: "birth_dates_date_dates",
      two: 24,
      theable: {
        marker: "birth_dates_date_dates",
        three: 28,
      }
    }
  },
]

const two_flattens = {
  marker: "list",
  flattenInPlaceRemove: ['isList', 'value'],
  flattenInPlace: [['value', 'property'], ['object']],
  isList: true,
  value: [
    {
      "marker": "gender",
      one: 23,
    },
    {
      "marker": "birth_dates_date_dates",
      one: 24,
    }
  ],
  object: {
    marker: "list",
    flattenInPlaceRemove: ['isList', 'value'],
    flattenInPlace: [['value', 'theable']],
    isList: true,
    value: [
      {
        "marker": "bob",
        person: 23,
      },
      {
        "marker": "alice",
        person: 24,
      }
    ],
  },
  property: {
    marker: "list",
    flattenInPlaceRemove: ['isList', 'value'],
    flattenInPlace: [['value', 'theable']],
    isList: true,
    value: [
      {
        "marker": "gender",
        two: 23,
      },
      {
        "marker": "birth_dates_date_dates",
        two: 24,
      }
    ],
    theable: {
      marker: "list",
      flattenInPlaceRemove: ['isList', 'value'],
      flattenInPlace: [['value']],
      isList: true,
      value: [
        {
          "marker": "gender",
          three: 24,
        },
        {
          "marker": "birth_dates_date_dates",
          three: 28,
        }
      ],
    }
  }
}

const two_flattens_expected = [
  {
    marker: "gender",
    one: 23,
    object: {
      marker: 'bob',
      person: 23,
    },
    property: {
      marker: "gender",
      two: 23,
      theable: {
        marker: "gender",
        three: 24,
      }
    }
  },
  {
    marker: "birth_dates_date_dates",
    one: 24,
    object: {
      marker: 'bob',
      person: 23,
    },
    property: {
      marker: "birth_dates_date_dates",
      two: 24,
      theable: {
        marker: "birth_dates_date_dates",
        three: 28,
      }
    }
  },
  {
    marker: "gender",
    one: 23,
    object: {
      marker: 'alice',
      person: 24,
    },
    property: {
      marker: "gender",
      two: 23,
      theable: {
        marker: "gender",
        three: 24,
      }
    }
  },
  {
    marker: "birth_dates_date_dates",
    one: 24,
    object: {
      marker: 'alice',
      person: 24,
    },
    property: {
      marker: "birth_dates_date_dates",
      two: 24,
      theable: {
        marker: "birth_dates_date_dates",
        three: 28,
      }
    }
  },
]

const with_array = {
  marker: "list",
  flattenInPlaceRemove: ['isList', 'value'],
  flattenInPlace: [['value', 'property', 'objects[0]'], ['object', 'objects[1]']],
  isList: true,
  value: [
    {
      "marker": "gender",
      one: 23,
    },
    {
      "marker": "birth_dates_date_dates",
      one: 24,
    }
  ],
  objects: [
    {
      marker: "list",
      flattenInPlaceRemove: ['isList', 'value'],
      flattenInPlace: [['value', 'theable']],
      isList: true,
      value: [
        {
          "marker": "gender",
          two: 23,
        },
        {
          "marker": "birth_dates_date_dates",
          two: 24,
        }
      ],
      theable: {
        marker: "list",
        flattenInPlaceRemove: ['isList', 'value'],
        flattenInPlace: [['value']],
        isList: true,
        value: [
          {
            "marker": "gender",
            three: 24,
          },
          {
            "marker": "birth_dates_date_dates",
            three: 28,
          }
        ],
      }
    },
    {
      marker: "list",
      flattenInPlaceRemove: ['isList', 'value'],
      flattenInPlace: [['value', 'theable']],
      isList: true,
      value: [
        {
          "marker": "bob",
          person: 23,
        },
        {
          "marker": "alice",
          person: 24,
        }
      ],
    },
  ],
  object: {
    marker: "list",
    flattenInPlaceRemove: ['isList', 'value'],
    flattenInPlace: [['value', 'theable']],
    isList: true,
    value: [
      {
        "marker": "bob",
        person: 23,
      },
      {
        "marker": "alice",
        person: 24,
      }
    ],
  },
  property: {
    marker: "list",
    flattenInPlaceRemove: ['isList', 'value'],
    flattenInPlace: [['value', 'theable']],
    isList: true,
    value: [
      {
        "marker": "gender",
        two: 23,
      },
      {
        "marker": "birth_dates_date_dates",
        two: 24,
      }
    ],
    theable: {
      marker: "list",
      flattenInPlaceRemove: ['isList', 'value'],
      flattenInPlace: [['value']],
      isList: true,
      value: [
        {
          "marker": "gender",
          three: 24,
        },
        {
          "marker": "birth_dates_date_dates",
          three: 28,
        }
      ],
    }
  }
}

const with_array_expected = [
  {
    marker: "gender",
    one: 23,
    objects: [
      {
        marker: "gender",
        two: 23,
        theable: {
          marker: "gender",
          three: 24,
        }
      },
      {
        marker: 'bob',
        person: 23,
      },
    ],
    object: {
      marker: 'bob',
      person: 23,
    },
    property: {
      marker: "gender",
      two: 23,
      theable: {
        marker: "gender",
        three: 24,
      }
    }
  },
  {
    marker: "birth_dates_date_dates",
    one: 24,
    objects: [
      {
        marker: "birth_dates_date_dates",
        two: 24,
        theable: {
          marker: "birth_dates_date_dates",
          three: 28,
        }
      },
      {
        marker: 'bob',
        person: 23,
      },
    ],
    object: {
      marker: 'bob',
      person: 23,
    },
    property: {
      marker: "birth_dates_date_dates",
      two: 24,
      theable: {
        marker: "birth_dates_date_dates",
        three: 28,
      }
    }
  },
  {
    marker: "gender",
    one: 23,
    objects: [
      {
        marker: "gender",
        two: 23,
        theable: {
          marker: "gender",
          three: 24,
        }
      },
      {
        marker: 'alice',
        person: 24,
      },
    ],
    object: {
      marker: 'alice',
      person: 24,
    },
    property: {
      marker: "gender",
      two: 23,
      theable: {
        marker: "gender",
        three: 24,
      }
    }
  },
  {
    marker: "birth_dates_date_dates",
    one: 24,
    objects: [
      {
        marker: "birth_dates_date_dates",
        two: 24,
        theable: {
          marker: "birth_dates_date_dates",
          three: 28,
        }
      },
      {
        marker: 'alice',
        person: 24,
      },
    ],
    object: {
      marker: 'alice',
      person: 24,
    },
    property: {
      marker: "birth_dates_date_dates",
      two: 24,
      theable: {
        marker: "birth_dates_date_dates",
        three: 28,
      }
    }
  },
]

describe('flattenInPlace', () => {
  it('NEOS23 noop', () => {
    const context = {}
    const actual = flattenInPlace(context)
    expect(actual).toStrictEqual([context])
  })

  it('NEOS23 one list', () => {
    const context = one_list
    const actual = flattenInPlace(context)
    expect(actual).toStrictEqual(one_list_expected)
  })

  it('NEOS23 one list with prop', () => {
    const context = one_list_with_other_prop
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(one_list_with_other_prop_expected)
  })

  it('NEOS23 one list with prop containing list', () => {
    const context = one_list_with_other_prop_containing_list
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    debugger
    expect(actual).toStrictEqual(one_list_with_other_prop_containing_list_expected)
  })

  it('NEOS23 two flattens', () => {
    const context = two_flattens
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    debugger
    expect(actual).toStrictEqual(two_flattens_expected )
  })

  it('NEOS23 with array', () => {
    const context = with_array
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    debugger
    expect(actual).toStrictEqual(with_array_expected )
  })
})
