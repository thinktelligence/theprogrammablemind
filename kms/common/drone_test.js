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

  test('NEO23 load causes define start point to be mentioned', async () => {
    await km.run(async ({mentions, api}) => {
      const ordinal = km.api.currentOrdinal()
      const lastPoint = mentions({ context: { marker: 'point' }, condition: (context) => context.ordinal == ordinal })
      expect(lastPoint.description).toBe('start')
    })
  })
})
