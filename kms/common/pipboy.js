const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const hierarchy = require('./hierarchy')
const countable = require('./countable')
const math = require('./math')
const comparable = require('./comparable')
const help = require('./help')
const pipboy_tests = require('./pipboy.test.json')
const instance = require('./pipboy.instance.json')

// start/stop listening
class API {
  initialize({ objects }) {
    this._objects = objects
  }
  // id in stats, inv, data, map, radio
  //      under stats: status, special, perks
  //      under inventory: weapons, apparel, aid
  setDisplay(id) {
    this._objects.display = id
  }

  showWeapons(id) {
    this._objects.showWeapons = id
  }

  setWeapon(id) {
  }

  getWeapons() {
  }

  // { item: 'stimpak', quantity: <number>, to?: [ { part: ['arm', 'leg', 'torso', head'], side?: ['left', 'right'] } ] }
  apply(item) {
    this._objects.apply = item
  }

  setName(item, name) {
    this._objects.setName = { item, name }
  }

  strip() {
    this._objects.strip = true
  }

  disarm() {
    this._objects.disarm = true
  }

  drink(item) {
    this._objects.drink = item
  }

  eat(item) {
    this._objects.eat = item
  }

  take(item) {
    this._objects.take = item
  }

  wear(item) {
    this._objects.wear = item
  }

  equip(item) {
    this._objects.equip = item
  }
  // wear/arm with default that
  // 'weapon', 'apparel'
  // TODO to: x (the pistol/a pistol/<specific pistol by id?>
  // add to favorite
  // equip/arm
  //   equip a pistol
  //   equip the 44 pistol
  // eat/use
  //   eat some food
  // apply all the stimpaks
  // show the highest damage guns
  // show the guns with the highest value
  // select a rifle
  // select a rifle with the most damage
  // wear a suit
  // apply a stimpak
  //
  // show the shotguns / show all the weapons / show all weapons
  // call this outfit the town outfit
  // call this outfit snappy dresser
  // call this gun blastey
  // call this the battle outfit
  // wear the town outfit
  // select an outfit
  // remove the hat
  // strip
  // disarm
  // 
  change(item) {
    this._objects.change = item
  }
}
const api = new API()

let config = {
  name: 'pipboy',
  // TODO mark default as local scope
  operators: [
    "([show] ([showable]))",
    "([showWeapons|show] ([weapon]))",
    "(([content]) [tab])",
    "([apply] ([stimpak]))",
    "([go] ([to2|to] ([showable|])))",
    "([change] ([changeable]))",
    "([equip] ([equipable]))",
    "([toDrink|drink] ([drinkable]))",
    "([eat] ([edible]))",
    "([take] ([takeable]))",
    // "([weapon])",
    // "([44_pistol|])",
    "([apparel])",
    "((!articlePOS/0 && !verby/0) [outfit|outfit])",
    // this doesnt work because the speech recognizer hears 'where'
    "([wear] ([wearable]))",
    "([strip])",
    "([disarm])",
    "([putOn|] ([wearable]))",
    "(([put]) <on>)",
    "([call] ([nameable]) ([outfit]))",
    "((condition/1,2) <propertyCondition|> (weapon/1))",
    // "([call] ([outfit]) ([outfitName]))",
    // wear the city outfit / wear a suit / wear a suit and hat / wear that
    // call this the town outfit
    // call this the battle outfit
    // wear/show the town outfit
    // select an outfit
    // show the outfits

    // TODO for future
    // { pattern: "([testsetup1] ([equipable]))", development: true },
  ],
  hierarchy: [
    ['weapon', 'countable'],
    ['property', 'comparable'],
    // ['weapon', 'showable'],
  ],
  priorities: [
    { context: [['articlePOS', 0], ['to2', 0], ], choose: [0] },
    { context: [['tab', 0], ['articlePOS', 0], ], choose: [0] },
    { context: [['articlePOS', 0], ['unknown', 1], ['outfit', 0]], ordered: true, choose: [1,2] },
    // TODO this should trigger a circular warning or somethign [['put', 0], ['on', 0]],
  ],
  bridges: [
    {
       where: where(),
       id: "put", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator) }",
       generatorp: ({context}) => `put on`,
    },
    { 
       where: where(),
       id: "propertyCondition", 
       before: ['adjective', 'articlePOS', 'the'],
       convolution: true,
       level: 0, 
       bridge: "{ ...next(after[0]), condition: before[0], modifiers: ['condition'] }",
    },
    { 
       where: where(),
       id: "on", 
       isA: ['preposition'],
       level: 0, 
       bridge: "{ ...before, marker: operator('putOn', 0), dead: false }",
       generatorp: async ({context, g}) => `put on ${await g(context.item)}`,
       semantic: ({api, context}) => {
         api.change(context.item.marker)
       }
    },
    { 
       where: where(),
       id: "change", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       localHierarchy: [ ['weapon', 'changeable'] ],
       generatorp: async ({context, g}) => `change ${await g(context.item)}`,
       semantic: ({api, context}) => {
         api.change(context.item.marker)
       }
    },
    { 
       where: where(),
       id: "disarm", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator) }",
       generatorp: ({context}) => `disarm`,
       semantic: ({api, context}) => {
         api.disarm()
       }
    },
    { 
       where: where(),
       id: "strip", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator) }",
       generatorp: ({context}) => `strip`,
       semantic: ({api, context}) => {
         api.strip()
       }
    },
    { 
       where: where(),
       id: "call", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0], name: after[1] }",
       generatorp: async ({context, g}) => `call ${await g(context.item)} ${await g(context.name)}`,
       semantic: ({api, context}) => {
         api.setName(context.item, context.name.name.value)
       }
    },
    { 
       where: where(),
       id: "putOn", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: async ({context, g}) => `put on ${await g(context.item)}`,
       semantic: ({api, context}) => {
         if (context.item.name) {
           api.wear({ name: context.item.name.value, type: 'outfit' })
         } else {
           api.wear({ type: context.item.value })
         }
       }
    },
    { 
       where: where(),
       id: "wear", 
       isA: ['verby'],
       words: ['where'], // the speech recognizer hears 'where' not 'wear'
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: async ({context, g}) => `wear ${await g(context.item)}`,
       semantic: ({api, context}) => {
         if (context.item.name) {
           api.wear({ name: context.item.name.value, type: 'outfit' })
         } else {
           api.wear({ type: context.item.value })
         }
       }
    },
    { 
       where: where(),
       id: "equip", 
       isA: ['verby'],
       level: 0, 
       localHierarchy: [ ['weapon', 'equipable'], ['thisitthat', 'equipable'] ],
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: async ({context, g}) => `equip ${await g(context.item)}`,
       semantic: async ({api, context}) => {
         let condition
         if (context.item.condition) {
           condition = { selector: context.item.condition.marker, property: context.item.condition.property[0].marker }
         }
         api.equip({ type: context.item.value, condition })
       }
    },
    { 
       where: where(),
       id: "toDrink", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: async ({context, g}) => `drink ${await g(context.item)}`,
       semantic: async ({api, context, e}) => {
         const value = await e(context.item)
         api.drink(value.value)
       }
    },
    { 
       where: where(),
       id: "eat", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: async ({context, g}) => `eat ${await g(context.item)}`,
       semantic: async ({api, context}) => {
         api.eat(context.item.value)
       }
    },
    { 
       where: where(),
       id: "take", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: async ({context, g}) => `take ${await g(context.item)}`,
       semantic: async ({api, context, e}) => {
         const value = await e(context.item)
         api.take(value.value)
       }
    },
    { 
       where: where(),
       id: "nameable", 
       isA: ['theAble'],
       children: ['thisitthat'],
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "outfit", 
       isA: ['nameable', 'wearable'],
       level: 0, 
       bridge: "{ ...next(operator), name: before[0], modifiers: ['name'] }" 
    },
    { 
       id: "equipable", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "drinkable", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "edible", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "takeable", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "changeable", 
       level: 0, 
       bridge: "{ ...next(operator) }" 
    },
    /*
    { 
       id: "44_pistol", 
       level: 0, 
       words: [' 44 pistol'],
       isA: ['pistol'],
       bridge: "{ ...next(operator) }" 
    },
    */
    { 
       id: "apparel", 
       level: 0, 
       isA: ['changeable'],
       bridge: "{ ...next(operator) }" 
    },
    /*
    { 
       id: "weapon", 
       level: 0, 
       words: ['weapons'],
       isA: ['changeable', 'equipable'],
       bridge: "{ ...next(operator) }" 
    },
    */
    { 
       id: "apply", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), item: after[0] }",
       generatorp: async ({context, g}) => `apply ${await g(context.item)}`,
       semantic: async ({api, context, e}) => {
          // { item: 'stimpak', quantity: <number>, to?: [ { part: ['arm', 'leg', 'torso', head'], side?: ['left', 'right'] } ] }
         const quantity = context.item.quantity ? (await e(context.item.quantity)).value : 1
         api.apply({ item: 'stimpak', quantity })
       }
    },
    { 
       id: "go", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), showable: after[0].showable }",
       generatorp: async ({context, g}) => `go to ${await g(context.showable)}`,
       semantic: ({api, context}) => {
         api.setDisplay(context.showable.value)
       }
    },
    {
       id: "to2", 
       isA: ['preposition'],
       level: 0, 
       bridge: "{ ...next(operator), showable: after[0] }",
       generatorp: async ({context, g}) => `to ${await g(context.showable)}`,
    },
    { 
       id: "showWeapons", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), showable: after[0] }",
       generatorp: async ({context, g}) => `show ${await g(context.showable)}`,
       semantic: ({api, context}) => {
         if (context.showable.quantity && context.showable.quantity.value == 'all') {
           api.showWeapons('all')
         } else {
           api.showWeapons(context.showable.value)
         }
       }
    },
    { 
       id: "show", 
       isA: ['verby'],
       level: 0, 
       bridge: "{ ...next(operator), showable: after[0] }",
       generatorp: async ({context, g}) => `show ${await g(context.showable)}`,
       semantic: ({api, context}) => {
         api.setDisplay(context.showable.value)
       }
    },
    { 
       id: "stimpak", 
       level: 0, 
       words: ['stimpaks', 'stimpack', 'stimpacks'],
       isA: ['theAble', 'countable'],
       bridge: "{ ...next(operator) }" 
    },
    { 
       id: "tab", 
       level: 0, 
       isA: ['showable'],
       bridge: "{ ...next(operator), showable: before[0], modifiers: ['showable'] }" 
    },
    { 
       id: "showable", 
       level: 0, 
       isA: ['theAble'],
       bridge: "{ ...next(operator) }" ,
    },
    /*
    { 
       id: "testsetup1", 
       development: true,
       level: 0, 
       bridge: "{ ...next(operator), type: after[0] }" ,
       localHierarchy: [ ['weapon', 'equipable'] ],
       generatorp: ({context, g}) => `${context.marker} ${g(context.type)}`,
       isA: ['verby'],
       semantic: ({context, kms}) => {
         kms.dialogues.api.mentioned({
           marker: context.type.marker,
           value: context.type.marker
         })
       }
    },
    */
    { 
       id: "content", 
       level: 0, 
       isA: ['showable'],
       bridge: "{ ...next(operator) }" ,
       words: [
                ['stat', 'stat'], 
                ['stats', 'stat'], 
                ['statistics', 'stat'], 
                ['inventory', 'inv'], 
                ['data', 'data'], 
                ['map', 'map'], 
                ['maps', 'map'], 
                ['quest', 'quest'],
                ['quests', 'quest'],
                ['stats', 'stats'],
                ['workshops', 'workshops'],
                ['radio', 'radio'],
                ['status', 'status'],
                ['special', 'special'],
                ['perks', 'perks'],
                // ['weapons', 'weapons'],
                ['apparel', 'apparel'],
                ['aid', 'aid'],
              ].map(
            ([word, value]) => { return { word, value } })
    },
  ],
};

/*
const addWeapon = (id) => {
  config.operators.push(`([${id}])`)
  config.bridges.push({ 
       id,
       level: 0, 
       isA: ['weapon', 'theAble'],
       bridge: "{ ...next(operator) }" 
  })
}
addWeapon('pistol')
addWeapon('rifle')
*/

const template = {
  configs: [
    "pistols rifles grenades mines and shotguns are weapons",
    "mines and grenades are explosives",
    "explosives are weapons",
    "pistols rifles and shotguns are firearms",
    "firearms are weapons",
    "hats armor and suits are clothes",
    // "a rifle is a weapon",
    //"a weapon is equipable and changeable"
    "a weapon is equipable",
    "clothes are wearable",
    // "weapons are countable",  TODO fix this
    "edible is a concept",
    "food is edible",
    "drinks are drinkable",
    "meat is food",
    "vegetables and fruit are food",
    "cola and pop are drinks",
    "medicine and stimpaks are takeable",
    "item modifies properties",
    "damage luck hp rads value ap charisma range and accuracy are item properties",
    config,
  ]
}

knowledgeModule({ 
  config: { name: 'pipboy' },
  includes: [hierarchy, countable, comparable, help, math],
  api: () => new API(),

  module,
  description: 'Control a pipboy with speech',
  template: { template, instance },
  test: {
    name: './pipboy.test.json',
    contents: pipboy_tests,
    checks: {
      objects: [
        'apply', 'change', 'disarm', 'drink', 'eat', 'equip', 'setName', 'strip', 'take', 'wear',
      ],
      context: defaultContextCheck,
    },
  },
})
