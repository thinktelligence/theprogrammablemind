const menus = require('./menus')

describe('helpers', () => {
  it('missing api error', async () => {
    const km = await menus()
    class API extends km.api.constructor {
    }
    const api = new API()
    try {
      await km.setApi(() => api)
      expect(true).toBe(false)
    } catch(e) {
      const expected = 'Error: The API for menus is not being provided by the API constructor.'
      expect(e.toString()).toBe(expected)
    }
  })

  it('setting api runs initialize', async () => {
    const km = await menus()
    class API extends km.api.constructor {
    }
    const api = new API()
    await km.setApi(() => {
      return {
        menus: api,
        ui: api,
      }
    })
    expect(api._config).not.toBeNull()
    expect(api._objects).not.toBeNull()
  })

  it('sdefault association set', async () => {
    const km = await menus()
    class API extends km.api.constructor {
    }
    const api = new API()
    await km.setApi(() => {
      return {
        menus: api,
        ui: api,
      }
    })
    expect(km.config.objects.associations).toStrictEqual(["menus"])
  })

  it('sdefault setup lands in right place', async () => {
    const km = await menus()
    class API extends km.api.constructor {
    }
    const api = new API()
    km.stop_auto_rebuild()
      await km.setApi(() => {
        return {
          menus: api,
          ui: api,
        }
      })
      try {
        km.api.addMenu('file')
        expect(true).toBe(false)
      } catch( e ) {
        expect(e.toString()).toBe('Error: The API cannot be accessed until the auto rebuild is restarted')
      }
  })
})

