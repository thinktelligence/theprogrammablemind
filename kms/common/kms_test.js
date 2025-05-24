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

  it('sdefault setup lands in right place', async () => {
    const km = await menus()
    class API extends km.api.constructor {
    }
    const api = new API()
    km.stop_auto_rebuild()
      await km.setApi(() => api)
      try {
        km.api.addMenu('file')
        expect(true).toBe(false)
      } catch( e ) {
        expect(e.toString()).toBe('Error: The API cannot be accessed until the auto rebuild is restarted')
      }
  })
})

