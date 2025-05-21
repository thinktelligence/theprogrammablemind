const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const ui = require('./ui')
const tests = require('./menus.test.json')
const instance = require('./menus.instance.json')

class API {
  initialize({ objects }) {
    this._objects = objects
    this._objects.show = []
  }

  move(direction, steps = 1, units = undefined) {
    this._objects.move = { direction, steps, units }
  }

  show(item) {
    this._objects.show.push(item)
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
    const config = this.args.config
    const id = name
    const languageId = `${name}Menu_menus`
    config.addOperator(`([${languageId}|])`)
    config.addBridge({ 
      id: `${languageId}`, 
      associations: [languageId],
      isA: ['menu_menus'],
      words: [{ word: name, value: id, instance: true }],
    })
    return { languageId, id }
  }

  addMenuItem(menuId, id, name) {
    const config = this.args.config
    const languageId = `${id}MenuItem_menus`
    config.addOperator(`([${languageId}|])`)
    config.addBridge({ 
      id: `${languageId}`, 
      associations: [menuId.languageId],
      isA: ['menu_menus_item_menus'],
      words: [{ word: name, value: id, path: [menuId.id, id], instance: true }],
    })
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
        "((@<= menu_menus) [typeOfMenu_menus|show] (@== menu_menus))",
      ],
      bridges: [
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
  api.addMenuItem(objectMenuId, 'objectOpen', 'open')
}

knowledgeModule({ 
  config,
  includes: [ui],
  api: () => new API(),

  module,
  description: 'Control menues with speech',
  test: {
    name: './menus.test.json',
    contents: tests,
    fixtures,
    checks: {
      objects: ['move', 'select', 'unselect', 'cancel', 'stop', 'show'],
      context: defaultContextCheck(['operator', 'direction', 'moveable']),
    },
  },
  template: {
    template,
    instance,
  }
})
