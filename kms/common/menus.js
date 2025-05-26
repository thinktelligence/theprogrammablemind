const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const ui = require('./ui')
const helpers = require('./helpers/menus')
const tests = require('./menus.test.json')
const instance = require('./menus.instance.json')

class MenusAPI {
  initialize({ objects, config }) {
    this._config = config
    this._objects = objects
    this._objects.show = []
    this._objects.menuDefs = []
    this._objects.directions = {}
  }

  setup() {
    this._objects.directions = {
      right: helpers.calculateRights(this._objects.menuDefs),
      left: helpers.calculateLefts(this._objects.menuDefs),
      up: helpers.calculateUps(this._objects.menuDefs),
      down: helpers.calculateDowns(this._objects.menuDefs),
      parents: helpers.calculateParents(this._objects.menuDefs),
      paths: helpers.calculatePaths(this._objects.menuDefs),
    }
  }

  close() {
    this._objects.close = true
  }

  move(direction, steps = 1, units = undefined) {
    this._objects.move = { direction, steps, units }
    let next = this.current()
    if (direction === 'left' || direction === 'right' ){
      next = this._objects.directions.parents[next]
    }
    for (let i = 0; i < steps; ++i) {
      next = this._objects.directions[direction][next]
    }
    if (next) {
      this.show(next)
    }
  }

  show(item) {
    this._objects.show.push(item)
    this._objects.current = item
  }

  current() {
    return this._objects.current
  }

  select(item) {
    this._objects.select = { item }
  }

  unselect(item) {
    this._objects.unselect = { item }
  }

  cancel(direction) {
    this._objects.cancel = true
  }

  stop(action) {
    this._objects.stop = action
  }

  addMenu(name) {
    const config = this._config
    const id = name
    const languageId = `${name}Menu_menus`
    config.addOperator(`([${languageId}|])`)
    config.addBridge({ 
      id: `${languageId}`, 
      associations: [languageId, 'menus'],
      isA: ['menu_menus'],
      words: [{ word: name, value: id, instance: true }],
    })
    this._objects.menuDefs.push({
      key: name,
      text: name,
      children: [],
    })
    this.setup()
    return { languageId, id }
  }

  addMenuItem(menuId, id, name) {
    const config = this._config
    const languageId = `${id}MenuItem_menus`
    config.addOperator(`([${languageId}|])`)
    config.addBridge({ 
      id: `${languageId}`, 
      associations: [menuId.languageId, 'menus'],
      isA: ['menu_menus_item_menus'],
      words: [{ word: name, value: id, path: [menuId.id, id], instance: true }],
    })
    const menu = this._objects.menuDefs.find((md) => md.key == menuId.id)
    menu.children.push({
      key: id,
      text: name,
    })
    this.setup()
  }
}

const config = {
  name: 'menus',
};

const template = {
  configs: [
    'setidsuffix _menus',
    "menu is a concept",
    "item is a concept",
    "menu modifies item",
    "menus and menu items are showable",
    {
      operators: [
        "([show_menus|show] (showable_menus))",
        "([close_menus|close] (menu_menus/*))",
        "((@<= menu_menus) [typeOfMenu_menus|show] (@== menu_menus))",
      ],
      bridges: [
        {
          id: 'close_menus',
          isA: ['verb'],
          associations: ['menus'],
          bridge: "{ ...next(operator), closee: after[0], generate: ['this', 'closee'] }",
          semantic: ({context, api}) => {
            api.close()
          }
        },
        {
          id: 'show_menus',
          isA: ['verb'],
          bridge: "{ ...next(operator), show: after[0], generate: ['this', 'show'] }",
          semantic: ({context, api}) => {
            if (context.show.instance) {
              api.show(context.show.value)
            }
          }
        },
        {
          id: 'typeOfMenu_menus',
          convolution: true,
          isA: ['adjective'],
          bridge: "{ ...after[0], modifiers: ['menus'], menus: before[0] }",
        },
      ],
      semantics: [
        {
          where: where(),
          match: ({context, isA}) => isA(context, 'showable_menus'),
          apply: async ({context, insert, s, fragments}) => {
            const value = context
            const fragment = fragments("show showable")
            const mappings = [{
              where: where(),
              match: ({context}) => context.value == 'showable_menus',
              apply: ({context}) => Object.assign(context, value),
            }]
            const instantiation = await fragment.instantiate(mappings)
            await s(instantiation)
          }
        },
      ]
    },
  ],
  fragments: [
    "show showable",
  ],
}

class UIAPI {
  constructor(menusAPI) {
    this.menusAPI = menusAPI
  }

  initialize() {
  }

  move(direction, steps = 1, units = undefined) {
    this.menusAPI.move(direction, steps, units)
  }

  select(item) {
    this.menusAPI.select(item)
  }

  unselect(item) {
    this.menusAPI.unselect(item)
  }

  cancel(direction) {
    this.menusAPI.cancel(direction)
  }

  stop(action) {
    this.menusAPI.stop(action)
  }

}

/*
   show the file menu
   pick the file open item
   show file

   file (<- instance of menu) menu (<- concept of menu)
*/
// called for the non-module load to setup fixtures
const fixtures = async ({api, fragment, s, config, objects, kms, isModule}) => {
  const fileMenuId = api.addMenu('file')
  const objectMenuId = api.addMenu('object')

  api.addMenuItem(fileMenuId, 'fileOpen', 'open')
  api.addMenuItem(fileMenuId, 'fileOpenRemote', 'open remote')
  api.addMenuItem(fileMenuId, 'fileClose', 'close')

  api.addMenuItem(objectMenuId, 'objectOpen', 'open')
  api.addMenuItem(objectMenuId, 'objectClose', 'close')
}

knowledgeModule({ 
  config,
  includes: [ui],
  // api: () => new API(),
  api: () => {
    const menusAPI = new MenusAPI()
    return {
      'menus': menusAPI,
      'ui': new UIAPI(menusAPI)
    }
  },
  apiKMs: ['menus', 'ui'],
  initializer: ({apis}) => {
    apis('sdefaults').addAssociation('menus')
  },

  module,
  description: 'Control menues with speech',
  test: {
    name: './menus.test.json',
    contents: tests,
    fixtures,
    checks: {
      objects: ['move', 'select', 'unselect', 'cancel', 'stop', 'show', 'menuDefs', 'close'],
      context: defaultContextCheck(['operator', 'direction', 'moveable']),
    },
  },
  template: {
    template,
    instance,
  }
})
