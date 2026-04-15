// declensions.test.js
const helpers = require('./helpers')
const droneKM = require('./drone')

const defaultCalibration = {
  "speed": 0.554,
  "widthOfTankInMM": 188,
  "widthOfTreadInMM": 44,
  "isCalibrated": true,
  "minPower": 20,
  "power": 20,
  "speedForward": 0.20799999999999996,
  "speedBackward": 0.19399999999999992,
}

describe('drone km', () => {
  let km 

  beforeEach( async () => {
    km = await droneKM({ useCache: false })
  })

  test('load causes define start point to be mentioned', async () => {
    await km.run(async ({recall, api}) => {
      const ordinal = km.api.currentOrdinal()
      const lastPoint = await recall({ context: { marker: 'point' }, condition: (context) => context.ordinal == ordinal })
      expect(lastPoint.description).toBe('start')
    })
  })

  test('test maximum speed error', async () => {
    const context = await km.run(async ({fragments}) => {
      return await fragments("forward", {}) 
    })
    const inserted = []
    km.addArgs((args) => {
      return {
        insert: (context) => {
          inserted.push(context)
        }
      }
    })
    km.api._objects.current.speed = 10
    await km.processContext(context)
    await km.api.sendCommand()
    expect(inserted[0].verbatim).toBe('The drone cannot go that fast. The maximum speed is 1.2 meters per second')
  })

  test('NEO23 test minimum speed error', async () => {
    const context = await km.run(async ({fragments}) => {
      return await fragments("forward", {}) 
    })
    const inserted = []
    km.addArgs((args) => {
      return {
        insert: (context) => {
          inserted.push(context)
        }
      }
    })
    km.api._objects.current.speed = 0
    await km.processContext(context)
    await km.api.sendCommand()
    expect(inserted[0].verbatim).toBe('The drone cannot go that fast. The minimum speed is 0.25 meters per second')
  })
})
