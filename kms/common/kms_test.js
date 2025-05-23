const menus = require('./menus')

describe('helpers', () => {
  it('NEO23 setting api runs initialize', async () => {
    const km = await menus()
    class API extends km.api.constructor {
    }
    const api = new API()
    km.setApi(() => api)
    expect(api._config).not.toBeNull()
    expect(api._objects).not.toBeNull()
  })
})

