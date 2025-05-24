const menus = require('./menus')

describe('helpers', () => {
  it('NEOS23 setting api runs initialize', async () => {
    const km = await menus()
    class API extends km.api.constructor {
    }
    const api = new API()
    await km.setApi(() => api)
    expect(api._config).not.toBeNull()
    expect(api._objects).not.toBeNull()
  })

  it('NEO23 sdefault association set', async () => {
    const km = await menus()
    class API extends km.api.constructor {
    }
    const api = new API()
    await km.setApi(() => api)
    expect(km.config.objects.associations).toStrictEqual(["menus"])
  })
})

