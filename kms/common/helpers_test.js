const helpers = require('./helpers')

newDateMock = (date) => {
  const dates = [
    new Date(date),
    new Date(date)
  ]
  return () => {
    return dates.pop()
  }
}

describe('helpers', () => {
  describe('processTemplateString', () => {
    const evaluate = (expression) => {
      return `evaluated(${expression})`
    }
    it('empty', async () => {
      const result = await helpers.processTemplateString("", evaluate)
      expect(result).toStrictEqual("")
    })
    it('no vars', async () => {
      const result = await helpers.processTemplateString("dude", evaluate)
      expect(result).toStrictEqual("dude")
    })
    it('one var', async () => {
      const result = await helpers.processTemplateString("dude + ${a}", evaluate)
      expect(result).toStrictEqual("dude + evaluated(a)")
    })
    it('date bug', async () => {
      const result = await helpers.processTemplateString("${month}/${day}/${year}", evaluate)
      expect(result).toStrictEqual("evaluated(month)/evaluated(day)/evaluated(year)")
    })
  })

  describe('unshiftL', () => {
    it('empty', async () => {
      l = []
      helpers.unshiftL(l, 1)
      expect(l).toStrictEqual([1])
    })
    it('has limit not limited', async () => {
      l = []
      helpers.unshiftL(l, 1, 10)
      expect(l).toStrictEqual([1])
    })
    it('has limit limited', async () => {
      l = [3,2,1]
      helpers.unshiftL(l, 4, 3)
      expect(l).toStrictEqual([4,3,2])
    })
  })

  describe('pushL', () => {
    it('empty', async () => {
      l = []
      helpers.pushL(l, 1)
      expect(l).toStrictEqual([1])
    })
    it('has limit not limited', async () => {
      l = []
      helpers.pushL(l, 1, 10)
      expect(l).toStrictEqual([1])
    })
    it('has limit limited', async () => {
      l = [1,2,3]
      helpers.pushL(l, 4, 3)
      expect(l).toStrictEqual([2,3,4])
    })
  })

  describe('getValue', () => {
    it('null object', async () => {
      expect(helpers.getValue('a')).toBe(undefined)
    })
    it('null path', async () => {
      expect(helpers.getValue(undefined, 'dude')).toBe(undefined)
    })
    it('single', async () => {
      expect(helpers.getValue('a', { a: 23 })).toBe(23)
    })
    it('missing', async () => {
      expect(helpers.getValue('a', { notA: 23 })).toBe(undefined)
    })
    it('double', async () => {
      expect(helpers.getValue('a.b', { a: { b: 23 } })).toBe(23)
    })
    it('double second is missing', async () => {
      expect(helpers.getValue('a.b', { a: { notB: 23 } })).toBe(undefined)
    })
  })

  describe('millisecondsUntilHourOfDay', () => {
    it('time is same day', async () => {
      const newDate = newDateMock( new Date("Sun Aug 01 2021 01:00:00 GMT-0700 (Pacific Daylight Time)") )
      const ms = helpers.millisecondsUntilHourOfDay(newDate, 2)
      expect(ms).toBe(1 * 60 * 60 * 1000)
    })

    it('time is next day', async () => {
      const newDate = newDateMock( new Date("Sun Aug 01 2021 02:00:00 GMT-0700 (Pacific Daylight Time)") )
      const ms = helpers.millisecondsUntilHourOfDay(newDate, 1)
      expect(ms).toBe(23 * 60 * 60 * 1000)
    })

    it('time is same hour make ms zero', async () => {
      const newDate = newDateMock( new Date("Sun Aug 01 2021 01:55:00 GMT-0700 (Pacific Daylight Time)") )
      const ms = helpers.millisecondsUntilHourOfDay(newDate, 1)
      expect(ms).toBe(0)
    })

    it('zip empty list', async () => {
      expect(helpers.zip([])).toStrictEqual([])
    })

    it('zip one list', async () => {
      expect(helpers.zip([1,2,3])).toStrictEqual([[1], [2], [3]])
    })

    it('zip two list', async () => {
      expect(helpers.zip([1,2,3], [4,5,6])).toStrictEqual([[1,4], [2,5], [3,6]])
    })

    it('zip three list', async () => {
      expect(helpers.zip([1,2,3], [4,5,6], [7,8,9])).toStrictEqual([[1,4,7], [2,5,8], [3,6,9]])
    })
  })
})

describe('focus', () => {
  it('empty', () => {
    context = {}
    expect(helpers.focus(context)).toStrictEqual({})
  })

  it('topLevel focusable not focus', () => {
    context = {
      focusable: ['a'],
      a: {
        value: 'this is a'
      }
    }
    expect(helpers.focus(context)).toStrictEqual(context)
  })

  it('topLevel focusable has focus', () => {
    context = {
      focusable: ['a'],
      a: {
        value: 'this is a',
        focus: true,
      }
    }
    expect(helpers.focus(context)).toStrictEqual(context.a)
  })

  it('topLevel focusable has focus nested two deep outer is set to focus', () => {
    context = {
      focusable: ['a'],
      a: {
        focusable: ['b'],
        b: { value: 'this is b', focus: true },
        value: 'this is a',
        focus: true,
      }
    }
    expect(helpers.focus(context)).toStrictEqual(context.a.b)
  })

  it('topLevel focusable has focus nested two deep outer is not set to focus', () => {
    context = {
      focusable: ['a'],
      a: {
        focusable: ['b'],
        b: { value: 'this is b', focus: true },
        value: 'this is a',
      }
    }
    expect(helpers.focus(context)).toStrictEqual(context.a.b)
  })
})

describe('removeProp (mutation-only)', () => {
  const data = () => ({
    a: 1,
    b: 2,
    c: { d: 3, e: null },
    arr: [1, null, 3],
    [Symbol('keep')]: 'stay',
    [Symbol('remove')]: 'go',
  });

  test('mutates and returns the same object', () => {
    const obj = { x: 1 };
    const res = helpers.removeProp(obj, () => true);
    expect(res).toBe(obj);
    expect(obj).toEqual({});
  });

  test('removes matching properties', () => {
    const obj = data();
    helpers.removeProp(obj, v => v === null);
    expect(obj.c.e).toBeUndefined();
    expect(obj.arr).toEqual([1, 3]);
  });

  test('removes array elements', () => {
    const arr = [10, 20, 30];
    helpers.removeProp(arr, v => v > 15);
    expect(arr).toEqual([10]);
  });

  test('handles symbols', () => {
    const sKeep = Symbol('keep');
    const sRemove = Symbol('remove');
    const obj = { [sKeep]: 1, [sRemove]: 2 };
    helpers.removeProp(obj, (v, k) => k === sRemove);
    expect(obj[sKeep]).toBe(1);
    expect(obj[sRemove]).toBeUndefined();
  });

  test('respects maxDepth', () => {
    const deep = { l1: { l2: { remove: true } } };
    helpers.removeProp(deep, (v, k) => k === 'remove', { maxDepth: 1 });
    expect(deep.l1.l2.remove).toBe(true); // not removed
  });

  test('circular references are safe', () => {
    const obj = {};
    obj.self = obj;
    expect(() => helpers.removeProp(obj, () => false)).not.toThrow();
  });

  test('primitives are returned unchanged', () => {
    expect(helpers.removeProp(42, () => true)).toBe(42);
    expect(helpers.removeProp(null, () => true)).toBe(null);
  });

  test('testFn receives (value, key/index, parent)', () => {
    const calls = [];
    const obj = { a: 1, b: [2] };
    helpers.removeProp(obj, (v, k, p) => {
      calls.push({ v, k, p: p === obj ? 'root' : 'child' });
      return false;
    });
    expect(calls).toContainEqual({ v: 1, k: 'a', p: 'root' });
    expect(calls).toContainEqual({ v: [2], k: 'b', p: 'root' });
    expect(calls).toContainEqual({ v: 2, k: 0, p: 'child' });
  });

  test('testFn receives (value, key/index, parent)', () => {
    const obj = {
      "interpolate": [
        {
          "range": {
            "start": 22,
            "end": 25
          },
        },
      ],
    }

    helpers.removeProp(obj, (v, k, p) => {
      console.log(`greg55: ${v}, ${k}, ${p}`)
      return k == 'range';
    });

    console.log(JSON.stringify(obj, null, 2))
  });
});

