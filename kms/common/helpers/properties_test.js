const { API } = require('./ordering')
const { API:APIProperties } = require('./properties')

describe('helpersProperties', () => {

  describe('propertyRelation - generators', () => {
    it('NEO23 propertyOfObjectIsValue', async () => {
      const objects = {}
      api = new API()
      api.objects = objects
      api.initialize(objects)
      api.createOrdering({ name: 'speed', categories: [['slowest', 'slow'], ['fastest', 'fast']], ordering: [['slowest', 'slow'], ['slow', 'fast'], ['fast', 'fastest']] })
      api.setCategory('speed', 'greg', 'a', 'slowest')
      api.setCategory('speed', 'greg', 'b', 'fast')
      expect(api.getLessThan({ name: 'speed', context: 'greg', smaller: 'a', larger: 'b' })).toStrictEqual( true )
      expect(api.getLessThan({ name: 'speed', context: 'greg', smaller: 'b', larger: 'a' })).toStrictEqual( false )
    })
  })

})
