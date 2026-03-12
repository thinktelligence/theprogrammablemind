const { smallestRotate, cartesianToPolar, rotateDelta } = require('./drone')

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
    expect(polar.angle).toBe(Math.PI)
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

describe('rotateDelta', () => {
  it('same spot', async () => {
    const delta  = rotateDelta(0, 0)
    expect(delta).toBe(0)
  })

  it('west', async () => {
    const delta  = rotateDelta(0, Math.PI/2)
    expect(delta).toBe(Math.PI/2)
  })

  it('east', async () => {
    const delta = rotateDelta(0, Math.PI*3/2)
    expect(delta).toBe(-Math.PI/2)
  })

  it('south', async () => {
    const delta = rotateDelta(0, Math.PI)
    expect(delta).toBe(-Math.PI)
  })
}
)
describe('smallestRotate', () => {
  it('no change', async () => {
    const delta = smallestRotate(0)
    expect(delta).toBe(0)
  })

  it('0 < x < 180', async () => {
    const delta = smallestRotate(Math.PI/4)
    expect(delta).toBe(Math.PI/4)
  })

  it('180 < x < 360', async () => {
    const delta = smallestRotate(Math.PI + Math.PI/4)
    expect(delta).toBe(-Math.PI*3/4)
  })

  it('x > 360', async () => {
    const delta = smallestRotate(4*Math.PI)
    expect(delta).toBe(0)
  })

  it('0 > x > -180', async () => {
    const delta = smallestRotate(-Math.PI/4)
    expect(delta).toBe(-Math.PI/4)
  })

  it('-180 > x > -360', async () => {
    const delta = smallestRotate(-(Math.PI + Math.PI/4))
    expect(delta).toBe(Math.PI*3/4)
  })

  it('x < -360', async () => {
    const delta = smallestRotate(-4*Math.PI)
    expect(delta).toBe(-0)
  })


})

