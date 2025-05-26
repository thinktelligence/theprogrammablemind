const { calculateRights, calculateLefts, calculateDowns, calculateUps, calculateParents, calculatePaths, } = require('./menus');

describe("downs", () => {
  test('calculate downs empty', () => {
    const sm = {
      key: "File",
      text: "File",
    }
    const downs = calculateDowns(sm)
    expect(downs).toStrictEqual({}) 
  });

  test('calculate downs one', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
      ]
    }
    const downs = calculateDowns(sm)
    expect(downs).toStrictEqual({ "File": "File-New" }) 
  });

  test('calculate downs two', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
        { key:"File-Open", text:"Open" },
      ]
    }
    const downs = calculateDowns(sm)
    expect(downs).toStrictEqual({ "File": "File-New", "File-New": "File-Open" }) 
  });

  test('calculate downs two with list', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
        { key:"File-Open", text:"Open" },
      ]
    }
    const downs = calculateDowns([sm])
    expect(downs).toStrictEqual({ "File": "File-New", "File-New": "File-Open" }) 
  });

  test('calculate downs three', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
        { key:"File-Open", text:"Open" },
        { key:"File-OpenAs", text:"Open As..." },
      ]
    }
    const downs = calculateDowns(sm)
    expect(downs).toStrictEqual({ "File": "File-New", "File-New": "File-Open", "File-Open": "File-OpenAs" }) 
  });
});

describe("ups", () => {
  test('calculate ups empty', () => {
    const sm = {
      key: "File",
      text: "File",
    }
    const ups = calculateUps(sm)
    expect(ups).toStrictEqual({}) 
  });

  test('calculate ups one', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
      ]
    }
    const ups = calculateUps(sm)
    expect(ups).toStrictEqual({}) 
  });

  test('calculate ups two', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
        { key:"File-Open", text:"Open" },
      ]
    }
    const ups = calculateUps(sm)
    expect(ups).toStrictEqual({ "File-Open": "File-New" }) 
  });

  test('calculate ups two with list', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
        { key:"File-Open", text:"Open" },
      ]
    }
    const ups = calculateUps([sm])
    expect(ups).toStrictEqual({ "File-Open": "File-New" }) 
  });

  test('calculate ups three', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
        { key:"File-Open", text:"Open" },
        { key:"File-OpenAs", text:"Open As..." },
      ]
    }
    const ups = calculateUps(sm)
    expect(ups).toStrictEqual({ "File-Open": "File-New", "File-OpenAs": "File-Open" }) 
  });
});

describe("parents", () => {
  test('calculate parents empty', () => {
    const sm = {
      key: "File",
      text: "File",
    }
    const parents = calculateParents([sm])
    expect(parents).toStrictEqual({ "File": "File" }) 
  });

  test('calculate parents one', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
      ]
    }
    const parents = calculateParents([sm])
    expect(parents).toStrictEqual({"File": "File", "File-New": "File"}) 
  });

  test('calculate parents two', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
        { key:"File-Open", text:"Open" },
      ]
    }
    const parents = calculateParents([sm])
    expect(parents).toStrictEqual({ "File": "File", "File-Open": "File", "File-New": "File" }) 
  });

  test('calculate parents two with list', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
        { key:"File-Open", text:"Open" },
      ]
    }
    const parents = calculateParents([sm])
    expect(parents).toStrictEqual({ "File": "File", "File-Open": "File", "File-New": "File" }) 
  });

  test('calculate parents three', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
        { key:"File-Open", text:"Open" },
        { key:"File-OpenAs", text:"Open As..." },
      ]
    }
    const parents = calculateParents([sm])
    expect(parents).toStrictEqual({ "File": "File", "File-Open": "File", "File-New": "File", "File-OpenAs": "File" }) 
  });
});

describe("lefts", () => {
  test('calculate lefts empty', () => {
    const sm = [{
      key: "File",
      text: "File",
    }]
    const lefts = calculateLefts(sm)
    expect(lefts).toStrictEqual({}) 
  });

  test('calculate lefts one', () => {
    const sm = [
      {
        key: "File",
        text: "File",
      },
      {
        key: "Object",
        text: "Object",
      },
    ]
    const lefts = calculateLefts(sm)
    expect(lefts).toStrictEqual({ "Object": "File" }) 
  });
});

describe("rights", () => {
  test('calculate rights empty', () => {
    const sm = [{
      key: "File",
      text: "File",
    }]
    const rights = calculateRights(sm)
    expect(rights).toStrictEqual({}) 
  });

  test('calculate rights one', () => {
    const sm = [
      {
        key: "File",
        text: "File",
      },
      {
        key: "Object",
        text: "Object",
      },
    ]
    const rights = calculateRights(sm)
    expect(rights).toStrictEqual({ "File": "Object" }) 
  });

});

describe("paths", () => {
  test('calculate paths empty', () => {
    const sm = {
      key: "File",
      text: "File",
    }
    const paths = calculatePaths(sm)
    expect(paths).toStrictEqual({ "File": ["File"] }) 
  });

  test('calculate paths one', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
      ]
    }
    const paths = calculatePaths(sm)
    expect(paths).toStrictEqual({ "File": ["File"], "File-New": ["File", "File-New"] }) 
  });

  test('calculate paths two', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
        { key:"File-Open", text:"Open" },
      ]
    }
    const paths = calculatePaths(sm)
    expect(paths).toStrictEqual({ "File": ["File"], "File-New": ["File", "File-New"], "File-Open": ["File", "File-Open"] }) 
  });

  test('calculate paths two with list', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
        { key:"File-Open", text:"Open" },
      ]
    }
    const paths = calculatePaths([sm])
    expect(paths).toStrictEqual({ "File": ["File"], "File-New": ["File", "File-New"], "File-Open": ["File", "File-Open"] }) 
  });

  test('calculate paths three', () => {
    const sm = {
      key: "File",
      text: "File",
      children: [
        { key:"File-New", text:"New" },
        { key:"File-Open", text:"Open" },
        { key:"File-OpenAs", text:"Open As..." },
      ]
    }
    const paths = calculatePaths(sm)
    expect(paths).toStrictEqual({ "File": ["File"], "File-New": ["File", "File-New"], "File-Open": ["File", "File-Open"], "File-OpenAs": ["File", "File-OpenAs"] }) 
  });
});

