const { API, unify, rules, getVariables, solveFor, applyMapping } = require('./formulas')

describe('helpers', () => {
  let x, t_plus_u, x_plus_y_times_z, x_times_y_plus_z, one_plus_2, x_equals_y

  beforeEach(() => {
    x = { ...x_init }
    t_plus_u = { ...t_plus_u_init }
    x_plus_y_times_z = { ...x_plus_y_times_z_init }
    x_times_y_plus_z = { ...x_times_y_plus_z_init }
    one_plus_2 = { ...one_plus_2_init }
    x_equals_y = { ...x_equals_y_init }
  })

  // TODO fix this
  xdescribe('getVariables', () => {
    it('none', async () => {
      expect(getVariables({})).toStrictEqual([{}])
    })

    it('single', async () => {
      expect(getVariables(x)).toStrictEqual([x])
    })

    it('plus', async () => {
      const actual = getVariables(t_plus_u)
      console.log(JSON.stringify(actual, null, 2))
      const expected_x = { ...t_plus_u.x }
      delete expected_x.value
      expect(actual[0].evalue.x).toStrictEqual(expected_x)
      const expected_y = { ...t_plus_u.y }
      delete expected_y.value
      expect(actual[0].evalue.y).toStrictEqual(expected_y)
    })

    it('minus', async () => {
      t_plus_u.marker = 'minus'
      expect(getVariables(t_plus_u)).toStrictEqual([t_plus_u.x, t_plus_u.y])
    })

    it('times', async () => {
      t_plus_u.marker = 'times'
      expect(getVariables(t_plus_u)).toStrictEqual([t_plus_u.x, t_plus_u.y])
    })

    it('divideBy', async () => {
      t_plus_u.marker = 'divideBy'
      expect(getVariables(t_plus_u)).toStrictEqual([t_plus_u.x, t_plus_u.y])
    })

    it('plus nested x + y * z', async () => {
      expect(getVariables(x_plus_y_times_z)).toStrictEqual([x_plus_y_times_z.x, x_plus_y_times_z.y.x, x_plus_y_times_z.y.y])
    })

    it('plus nested x * y + z', async () => {
      expect(getVariables(x_times_y_plus_z)).toStrictEqual([x_times_y_plus_z.x.x, x_times_y_plus_z.x.y, x_times_y_plus_z.y])
    })

    it('1 + 2', async () => {
      expect(getVariables(one_plus_2)).toStrictEqual([])
    })
  })

  describe('API', () => {
    it('add+get', async () => {
      const name = { value: 'formula1' }
      const formula = x
      const objects = {}
      const api = new API()
      api.initialize({objects})

      api.add(name, formula)
      expect(api.get(name).formula).toStrictEqual(x)
    })
  })

  /* 
    solve for x
      x = y => y = z
      x = y + z => x - y = z + z - z = y
      y = x * z => x = y / z
      y = x / z => x = y * z
      y = x - z => x = y + z
  */

  const constructors = {
    equals: (x, y) => {
      return { marker: 'equals', left: x, right: y }
    },
    add: (x, y) => {
      return { marker: 'plusExpression', x, y }
    },
    subtract: (x, y) => {
      return { marker: 'minusExpression', x, y }
    },
    multiply: (x, y) => {
      return { marker: 'timesExpression', x, y }
    },
    divide: (x, y) => {
      return { marker: 'divideByExpression', x, y }
    },
  }

  describe('unify', () => {
    it('x1 = y1 => x1 = y1', async () => {
      const { equals, add, subtract, multiply, divide} = constructors
      const actual = await unify(rules(constructors)[0], await equals('x1', 'y1'))
      const expected = await equals('x1', 'y1')
      expect(actual).toStrictEqual(expected)
    })

    it('x1 = y1 => y1 = x1', async () => {
      const { equals, add, subtract, multiply, divide} = constructors
      const actual = await unify(rules(constructors)[1], await equals('x1', 'y1'))
      const expected = await equals('y1', 'x1')
      expect(actual).toStrictEqual(expected)
    })

    it('x1 = y1 + 1 => y1 = x1 - 1', async () => {
      const { equals, add, subtract, multiply, divide} = constructors
      const actual = await unify(rules(constructors)[2], await equals('x1', await add('y1', '1')))
      const expected = await equals('y1', await subtract('x1', '1'))
      expect(actual).toStrictEqual(expected)
    })

    it('x1 = y1 - z1 => y1 = x1 + z1', async () => {
      const { equals, add, subtract, multiply, divide} = constructors
      const actual = await unify(rules(constructors)[3], await equals('x1', await subtract('y1', 'z1')))
      const expected = await equals('y1', await add('x1', 'z1'))
      expect(actual).toStrictEqual(expected)
    })

    it('x1 = y1 * z1 => y1 = x1 / z1', async () => {
      const { equals, add, subtract, multiply, divide} = constructors
      const actual = await unify(rules(constructors)[4], await equals('x1', await multiply('y1', 'z1')))
      const expected = await equals('y1', await divide('x1', 'z1'))
      expect(actual).toStrictEqual(expected)
    })

    it('x1 = y1 / z1 => y1 = x1 * z1', async () => {
      const { equals, add, subtract, multiply, divide} = constructors
      const actual = await unify(rules(constructors)[5], await equals('x1', await divide('y1', 'z1')))
      const expected = await equals('y1', await multiply('x1', 'z1'))
      expect(actual).toStrictEqual(expected)
    })

    /*
    it('x1 = y1*z1 + 1 => y1 = (x1 - 1)/z1', async () => {
      const { equals, add, subtract, multiply, divide} = constructors
      const actual = await unify(rules(constructors)[2], await equals('x1', await add('y1', '1')))
      const expected = await equals('y1', await subtract('x1', '1'))
      expect(actual).toStrictEqual(expected)
    })
    */

    xit('x = y match', async () => {
      const value = { marker: 'equals', left: 'x', right: { marker: '+', x: 'y', y: 'z' } }

      function f(values, variable) {
        return (value) => {
          if (!value) {
            throw new Error("Value not present")
          }
          if (values[variable] && values[variable] != value) {
            throw new Error("Variable already set to different value")
          }
          values[variable] = value
          return true
        }
      }

      const rule = {
        values: { x: null, y: null, z: null },
        head: (values) => { return { marker: 'equals', left: f(values, 'x'), right: { marker: "+", x: f(values, 'y'), y: f(values, 'z') } } },
        body: ({x, y, z}) => { return { marker: 'equals', left: x, right: { marker: "+", x: y, y: z } } }
      }

      const body = unify(rule, value)
      expect(body).toStrictEqual(rule.body({ x: 'x', y: 'y', z: 'z' }))
    })
  })

  describe('solveFor', () => {
    it('no solution', async () => {
      expect(await solveFor(constructors, {}, x)).toStrictEqual(undefined)
    })

    xit('x = y solve for x', async () => {
      expect(await solveFor(constructors, x_equals_y, x_equals_y.left)).toStrictEqual(x_equals_y)
    })

    xit('NEO23 x = y solve for y', async () => {
      expect(await solveFor(constructors, x_equals_y, x_equals_y.right)).toStrictEqual({ ...x_equals_y, left: x_equals_y.right, right: x_equals_y.left })
    })
  })
})

const x_init = {
  "default": true,
  "marker": "x",
  "range": {
    "end": 0,
    "start": 0
  },
  "text": "x",
  "topLevel": true,
  "value": "x",
  "word": "x"
}

const t_plus_u_init = {
  "evaluate": true,
  "evalue": {
    "evaluate": true,
    "isResponse": true,
    "marker": "plus",
    "number": "one",
    "paraphrase": true,
    "range": {
      "end": 4,
      "start": 0
    },
    "text": "t + u",
    "topLevel": true,
    "value": "+",
    "word": "+",
    "x": {
      "marker": "unknown",
      "range": {
        "end": 0,
        "start": 0
      },
      "text": "t",
      "types": [
        "number",
        "unknown"
      ],
      "unknown": true,
      "word": "t"
    },
    "y": {
      "marker": "unknown",
      "range": {
        "end": 4,
        "start": 4
      },
      "text": "u",
      "types": [
        "number",
        "unknown"
      ],
      "unknown": true,
      "word": "u"
    }
  },
  "isResponse": true,
  "marker": "plus",
  "number": "one",
  "range": {
    "end": 4,
    "start": 0
  },
  "text": "t + u",
  "topLevel": true,
  "touchedBy": [
    "call2"
  ],
  "value": "+",
  "word": "+",
  "x": {
    "marker": "unknown",
    "range": {
      "end": 0,
      "start": 0
    },
    "text": "t",
    "types": [
      "number",
      "unknown"
    ],
    "unknown": true,
    "value": "t",
    "word": "t"
  },
  "y": {
    "marker": "unknown",
    "range": {
      "end": 4,
      "start": 4
    },
    "text": "u",
    "types": [
      "number",
      "unknown"
    ],
    "unknown": true,
    "value": "u",
    "word": "u"
  }
}


const x_plus_y_times_z_init = {
  "evaluate": true,
  "evalue": {
    "evaluate": true,
    "isResponse": true,
    "marker": "plus",
    "number": "one",
    "paraphrase": true,
    "range": {
      "end": 8,
      "start": 0
    },
    "text": "x + y * z",
    "topLevel": true,
    "value": "+",
    "word": "+",
    "x": {
      "default": true,
      "marker": "x",
      "range": {
        "end": 0,
        "start": 0
      },
      "text": "x",
      "types": [
        "x"
      ],
      "word": "x"
    },
    "y": {
      "evaluate": true,
      "isResponse": true,
      "marker": "times",
      "number": "one",
      "range": {
        "end": 8,
        "start": 4
      },
      "text": "y * z",
      "types": [
        "number",
        "times",
        "y"
      ],
      "word": "*",
      "x": {
        "default": true,
        "marker": "y",
        "range": {
          "end": 4,
          "start": 4
        },
        "text": "y",
        "types": [
          "y"
        ],
        "value": "y",
        "word": "y"
      },
      "y": {
        "marker": "unknown",
        "range": {
          "end": 8,
          "start": 8
        },
        "text": "z",
        "types": [
          "number",
          "unknown"
        ],
        "unknown": true,
        "value": "z",
        "word": "z"
      }
    }
  },
  "isResponse": true,
  "marker": "plus",
  "number": "one",
  "range": {
    "end": 8,
    "start": 0
  },
  "text": "x + y * z",
  "topLevel": true,
  "touchedBy": [
    "call2"
  ],
  "value": "+",
  "word": "+",
  "x": {
    "default": true,
    "marker": "x",
    "range": {
      "end": 0,
      "start": 0
    },
    "text": "x",
    "types": [
      "x"
    ],
    "value": "x",
    "word": "x"
  },
  "y": {
    "evaluate": true,
    "isResponse": true,
    "marker": "times",
    "number": "one",
    "range": {
      "end": 8,
      "start": 4
    },
    "text": "y * z",
    "types": [
      "number",
      "times",
      "y"
    ],
    "value": null,
    "word": "*",
    "x": {
      "default": true,
      "marker": "y",
      "range": {
        "end": 4,
        "start": 4
      },
      "text": "y",
      "types": [
        "y"
      ],
      "value": "y",
      "word": "y"
    },
    "y": {
      "marker": "unknown",
      "range": {
        "end": 8,
        "start": 8
      },
      "text": "z",
      "types": [
        "number",
        "unknown"
      ],
      "unknown": true,
      "value": "z",
      "word": "z"
    }
  }
}

const x_times_y_plus_z_init = {
  "evaluate": true,
  "evalue": {
    "evaluate": true,
    "isResponse": true,
    "marker": "plus",
    "number": "one",
    "paraphrase": true,
    "range": {
      "end": 8,
      "start": 0
    },
    "text": "x * y + z",
    "topLevel": true,
    "value": "+",
    "word": "+",
    "x": {
      "evaluate": true,
      "isResponse": true,
      "marker": "times",
      "number": "one",
      "range": {
        "end": 4,
        "start": 0
      },
      "text": "x * y",
      "types": [
        "times",
        "x",
        "y"
      ],
      "word": "*",
      "x": {
        "default": true,
        "marker": "x",
        "range": {
          "end": 0,
          "start": 0
        },
        "text": "x",
        "types": [
          "x"
        ],
        "value": "x",
        "word": "x"
      },
      "y": {
        "default": true,
        "marker": "y",
        "range": {
          "end": 4,
          "start": 4
        },
        "text": "y",
        "types": [
          "y"
        ],
        "value": "y",
        "word": "y"
      }
    },
    "y": {
      "marker": "unknown",
      "range": {
        "end": 8,
        "start": 8
      },
      "text": "z",
      "types": [
        "number",
        "unknown"
      ],
      "unknown": true,
      "word": "z"
    }
  },
  "isResponse": true,
  "marker": "plus",
  "number": "one",
  "range": {
    "end": 8,
    "start": 0
  },
  "text": "x * y + z",
  "topLevel": true,
  "touchedBy": [
    "call2"
  ],
  "value": "+",
  "word": "+",
  "x": {
    "evaluate": true,
    "isResponse": true,
    "marker": "times",
    "number": "one",
    "range": {
      "end": 4,
      "start": 0
    },
    "text": "x * y",
    "types": [
      "times",
      "x",
      "y"
    ],
    "value": null,
    "word": "*",
    "x": {
      "default": true,
      "marker": "x",
      "range": {
        "end": 0,
        "start": 0
      },
      "text": "x",
      "types": [
        "x"
      ],
      "value": "x",
      "word": "x"
    },
    "y": {
      "default": true,
      "marker": "y",
      "range": {
        "end": 4,
        "start": 4
      },
      "text": "y",
      "types": [
        "y"
      ],
      "value": "y",
      "word": "y"
    }
  },
  "y": {
    "marker": "unknown",
    "range": {
      "end": 8,
      "start": 8
    },
    "text": "z",
    "types": [
      "number",
      "unknown"
    ],
    "unknown": true,
    "value": "z",
    "word": "z"
  }
}

const one_plus_2_init = {
  "evaluate": true,
  "evalue": 3,
  "isResponse": true,
  "marker": "plus",
  "number": "one",
  "range": {
    "end": 4,
    "start": 0
  },
  "text": "1 + 2",
  "topLevel": true,
  "touchedBy": [
    "call2"
  ],
  "value": "+",
  "word": "+",
  "x": {
    "marker": "number",
    "range": {
      "end": 0,
      "start": 0
    },
    "text": "1",
    "types": [
      "number"
    ],
    "value": 1,
    "word": "1"
  },
  "y": {
    "marker": "number",
    "range": {
      "end": 4,
      "start": 4
    },
    "text": "2",
    "types": [
      "number"
    ],
    "value": 2,
    "word": "2"
  }
}

const x_equals_y_init =   {
  "left": {
    "marker": "unknown",
    "range": {
      "end": 0,
      "start": 0
    },
    "text": "x",
    "types": [
      "expression",
      "unknown"
    ],
    "unknown": true,
    "value": "x",
    "word": "x"
  },
  "marker": "equals",
  "range": {
    "end": 4,
    "start": 0
  },
  "right": {
    "marker": "unknown",
    "range": {
      "end": 4,
      "start": 4
    },
    "text": "y",
    "types": [
      "expression",
      "unknown"
    ],
    "unknown": true,
    "value": "y",
    "word": "y"
  },
  "text": "x = y",
  "topLevel": true,
  "touchedBy": [
    "call2"
  ],
  "value": "=",
  "word": "="
}
