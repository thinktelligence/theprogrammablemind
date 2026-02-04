const { cartesianToPolar } = require('./drone')

/*
                 ^
                 y
                 |
                 90
                 |
     -180/180 <--^--> 0 -- x ->
                 |
                -90 


  angle changes are from current direction -180 to 180
*/

describe('cartesianToPolar', () => {
  it('same spot', async () => {
    const from = { x: 1, y: 1 }
    const polar = cartesianToPolar(from, from)
    expect(polar.angle).toBe(0)
    expect(polar.radius).toBe(0)
  })

  it('go right to point from being aimed right', async () => {
    const from = { x: 0, y: 0 }
    const angle = 0
    const to = { x: 1, y: 0 }
    const polar = cartesianToPolar(from, to)
    expect(polar.angle).toBe(0)
    expect(polar.radius).toBe(1)
  })

  it('go up to point from being aimed right', async () => {
    const from = { x: 0, y: 0 }
    const angle = 0
    const to = { x: 0, y: 1 }
    const polar = cartesianToPolar(from, to)
    expect(polar.angle).toBe(Math.PI/2)
    expect(polar.radius).toBe(1)
  })

  it('go left to point from being aimed right', async () => {
    const from = { x: 0, y: 0 }
    const to = { x: -1, y: 0 }
    const polar = cartesianToPolar(from, to)
    expect(polar.angle).toBe(0)
    expect(polar.radius).toBe(1)
  })

  it('go down to point from being aimed right', async () => {
    const from = { x: 0, y: 0 }
    const to = { x: 0, y: -1 }
    const polar = cartesianToPolar(from, to)
    expect(polar.angle).toBe(-Math.PI/2)
    expect(polar.radius).toBe(1)
  })
})

