const menus = require('./menus')

describe('helpers', () => {
  it('setting api runs initialize', async () => {
    const km = await menus()
    class API extends km.api.constructor {
    }
    const api = new API()
    await km.setApi(() => api)
    expect(api._config).not.toBeNull()
    expect(api._objects).not.toBeNull()
  })

  it('sdefault association set', async () => {
    const km = await menus()
    class API extends km.api.constructor {
    }
    const api = new API()
    await km.setApi(() => api)
    expect(km.config.objects.associations).toStrictEqual(["menus"])
  })
})

