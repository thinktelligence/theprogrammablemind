const _ = require('lodash')
const { flattenInPlace, getPaths } = require('./flatten_in_place')

const has_value_but_is_not_a_list = {
  marker: "person",
  flattenInPlaceRemove: ['isList', 'value'],
  flattenInPlace: [['value']],
  value: 'person',
}
const has_value_but_is_not_a_list_expected = [
  {
    marker: "person",
  },
]

/*
  Object.assign(getByPath(context, []), getByPath(context, ['value'][i]))
*/
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

const not_list = {
  "marker": "gender",
  "flattenInPlaceRemove": [],
  "flattenInPlace": [
    [ "object" ]
  ],
  "object": {
    "marker": "list",
    "flattenInPlaceRemove": [
      "listable",
      "isList",
      "value"
    ],
    "flattenInPlace": [['value']],
    "isList": true,
    "value": [
      {
        "marker": "bob",
      },
      {
        "marker": "alice",
      }
    ],
  }
}

const not_list_expected = [
  {
    "marker": "gender",
    "flattenInPlaceRemove": [],
    "flattenInPlace": [
      [ "object" ]
    ],
    "object": {
      "marker": "bob",
    },
  },
  {
    "marker": "gender",
    "flattenInPlaceRemove": [],
    "flattenInPlace": [
      [ "object" ]
    ],
    "object": {
      "marker": "alice",
    }
  },
]

/*
  Object.assign(getByPath(context, []), getByPath(context, ['value'][i]))
  Object.assign(getByPath(context, ['property']), getByPath(context, ['property', 'value'])[i])
*/
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

const one_list_with_other_prop_as_array = {
  marker: "list",
  flattenInPlaceRemove: ['isList', 'value'],
  flattenInPlace: [['value', 'property[0]']],
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
  property: [{
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
  }]
}

const one_list_with_other_prop_as_array_expected = [
  {
    "marker": "gender",
    other: 27,
    "property": [{
      "marker": "gender",
      inner: 44,
    }]
  },
  {
    "marker": "birth_dates_date_dates",
    other: 28,
    "property": [{
      "marker": "birth_dates_date_dates",
      inner: 45,
    }]
  }
]

/*
  Object.assign(getByPath(context, []), getByPath(context, ['value'][i]))
  Object.assign(getByPath(context, ['property']), getByPath(context, ['property', 'value'])[i])
  Object.assign(getByPath(context, ['property', 'theable']), getByPath(context, ['property', 'theable', 'value'])[i])
*/
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

/*
  0:
    value
    property.value
    property.theable.value
  1:
    object.value
*/
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
    flattenInPlace: [['value']],
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

const with_one_array = {
  marker: "list",
  flattenInPlaceRemove: ['isList', 'value'],
  flattenInPlace: [['value', 'objects[0]']],
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
      flattenInPlace: [['value']],
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
    },
  ],
}

const with_one_array_expected = [
  {
    marker: "gender",
    one: 23,
    objects: [
      {
        "marker": "gender",
        two: 23,
      },
    ],
  },
  {
    "marker": "birth_dates_date_dates",
    one: 24,
    objects: [
      {
        "marker": "birth_dates_date_dates",
        two: 24,
      },
    ],
  },
]

/*
  0:
    value
    objects[0].value
    property.value
  1:
    object.value
    objects[1].value
*/

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

const with_array_reverse_order = {
  marker: "list",
  flattenInPlaceRemove: ['isList', 'value'],
  flattenInPlace: [['object', 'objects[1]'], ['value', 'property', 'objects[0]']],
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

const with_array_reverse_order_expected = [
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

const with_array_first_is_not_list = {
  marker: "gender",
  flattenInPlaceRemove: ['isList', 'value'],
  flattenInPlace: [['value', 'property', 'objects[0]'], ['objects[1]']],
  two: 23,
  value: "gender",
  objects: [
    {
      marker: "gender",
      two: 23,
    },
    {
      marker: "list",
      flattenInPlaceRemove: ['isList', 'value'],
      flattenInPlace: [['value']],
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
}

const with_array_first_is_not_list_expected = [
  {
    marker: "gender",
    two: 23,
    objects: [
      {
        marker: "gender",
        two: 23,
      },
      {
        marker: 'bob',
        person: 23,
      },
    ],
  },
  {
    marker: "gender",
    two: 23,
    objects: [
      {
        marker: "gender",
        two: 23,
      },
      {
        marker: 'alice',
        person: 24,
      },
    ],
  },
]

const with_array_first_is_not_list_reverse_order = {
  marker: "gender",
  flattenInPlaceRemove: ['isList', 'value'],
  flattenInPlace: [['objects[1]'], ['value', 'property', 'objects[0]']],
  two: 23,
  value: "gender",
  objects: [
    {
      marker: "gender",
      two: 23,
    },
    {
      marker: "list",
      flattenInPlaceRemove: ['isList', 'value'],
      flattenInPlace: [['value']],
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
}

const with_array_first_is_not_list_reverse_order_expected = [
  {
    marker: "gender",
    two: 23,
    objects: [
      {
        marker: "gender",
        two: 23,
      },
      {
        marker: 'bob',
        person: 23,
      },
    ],
  },
  {
    marker: "gender",
    two: 23,
    objects: [
      {
        marker: "gender",
        two: 23,
      },
      {
        marker: 'alice',
        person: 24,
      },
    ],
  },
]


describe('flattenInPlace', () => {
  it('NEOS23 none', () => {
    const context = {}
    const actual = getPaths(context)
    expect(actual).toStrictEqual([])
  })

  it('NEOS23 one_list', () => {
    const context = one_list
    const actual = getPaths(context)
    expect(actual).toStrictEqual([[['value']]])
  })

  it('NEOS23 not_list', () => {
    const context = not_list
    const actual = getPaths(context)
    expect(actual).toStrictEqual([[['object', 'value']]])
  })

  it('NEOS23 one_list_with_other_prop', () => {
    const context = one_list_with_other_prop
    const actual = getPaths(context)
    expect(actual).toStrictEqual([[['value'], ['property', 'value']]])
  })

  it('NEOS23 one_list_with_other_prop_as_array', () => {
    const context = one_list_with_other_prop_as_array
    const actual = getPaths(context)
    expect(actual).toStrictEqual([[['value'], ['property[0]', 'value']]])
  })

  it('NEOS23 two_flattens', () => {
    const context = two_flattens
    const actual = getPaths(context)
    console.dir(actual)
    expect(actual).toStrictEqual([[['value'], ['property', 'value'], ['property', 'theable', 'value']], [['object', 'value']]])
  })

  it('NEOS23 with_one_array', () => {
    const context = with_one_array
    const actual = getPaths(context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual([[['value'], ['objects[0]', 'value']]])
  })

  it('NEOS23 with_array', () => {
    const context = with_array
    const actual = getPaths(context)
    console.log(JSON.stringify(actual, null, 2))
    console.dir(actual)
    expected = [
      [
        [ 'value' ],
        [ 'objects[0]', 'value' ],
        [ 'objects[0]', 'theable', 'value' ],
        [ 'property', 'value' ],
        [ 'property', 'theable', 'value' ]
      ],
      [ [ 'objects[1]', 'value' ], [ 'object', 'value' ] ]
    ]

    expect(actual).toStrictEqual(expected)
  })

  it('NEOS23 with_array_first_is_not_list', () => {
    const context = with_array_first_is_not_list
    const actual = getPaths(context)
    console.log(JSON.stringify(actual, null, 2))
    console.dir(actual)
    expected = [
      [ [ 'value' ] ],
      [ [ 'objects[1]', 'value' ], ],
    ]

    expect(actual).toStrictEqual(expected)
  })

  it('NEOS23 with_array_first_is_not_list_reverse_order', () => {
    const context = with_array_first_is_not_list_reverse_order
    const actual = getPaths(context)
    console.log(JSON.stringify(actual, null, 2))
    console.dir(actual)
    expected = [
      [ [ 'objects[1]', 'value' ], ],
      [ [ 'value' ] ],
    ]

    expect(actual).toStrictEqual(expected)
  })

  it('NEOS23 has_value_but_is_not_a_list', () => {
    const context = has_value_but_is_not_a_list
    const actual = getPaths(context)
    console.log(JSON.stringify(actual, null, 2))
    console.dir(actual)
    expected = [[['value']]]
    expect(actual).toStrictEqual(expected)
  })
})

describe('flattenInPlace', () => {
  it('NEOS23 noop', () => {
    const context = {}
    const actual = flattenInPlace(context)
    expect(actual).toStrictEqual([context])
  })

  it('NEOS23 has_value_but_is_not_a_list', () => {
    const context = has_value_but_is_not_a_list
    const actual = flattenInPlace(context)
    expect(actual).toStrictEqual(has_value_but_is_not_a_list_expected)
  })

  it('NEOS23 one list', () => {
    const context = one_list
    const actual = flattenInPlace(context)
    expect(actual).toStrictEqual(one_list_expected)
  })

  it('NEOS23 not_list', () => {
    const context = not_list
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(not_list_expected)
  })

  it('NEOS23 one list with prop', () => {
    const context = one_list_with_other_prop
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(one_list_with_other_prop_expected)
  })

  it('NEOS23 one list with prop as arrayone_list_with_other_prop_as_array', () => {
    const context = one_list_with_other_prop_as_array
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(one_list_with_other_prop_as_array_expected)
  })

  it('NEOS23 one list with prop containing list', () => {
    const context = one_list_with_other_prop_containing_list
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(one_list_with_other_prop_containing_list_expected)
  })

  it('NEOS23 two flattens', () => {
    const context = two_flattens
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(two_flattens_expected )
  })

  it('NEOS23 with one array', () => {
    const context = with_one_array
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(with_one_array_expected )
  })

  it('NEOS23 with array', () => {
    const context = with_array
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(with_array_expected )
  })

  it('NEOS23 with_array_reverse_order', () => {
    const context = with_array_reverse_order
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(with_array_reverse_order_expected )
  })

  it('NEO23 with_array_first_is_not_list_reverse_order', () => {
    const context = with_array_first_is_not_list_reverse_order
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(with_array_first_is_not_list_reverse_order_expected)
  })

  it('NEOS23 not_list', () => {
    const context = not_list
    const actual = flattenInPlace(context)
    console.log(JSON.stringify(actual, null, 2))
    expect(actual).toStrictEqual(not_list_expected)
  })
})
