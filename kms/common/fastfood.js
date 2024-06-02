const { Config, knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck, propertyToArray } = require('./helpers')
const edible = require('./edible')
const events = require('./events')
const countable = require('./countable')
ensureTestFile(module, 'fastfood', 'test')
ensureTestFile(module, 'fastfood', 'instance')

const fastfood_tests = require('./fastfood.test.json')
const fastfood_instance = require('./fastfood.instance.json')

/*
  hello -> to order
  can I help you? -> expect order
    a big mac and large fries with a large coke
  gimme a big mac and large fries with a large coke
  make them large
  no small instead
  give me a combo one / give me a single combo / i want combo one
  i want 2 hamburgers -> what kind?
    big mac
    big mac quarter pounder

  single and double combo
  single combo
  combo one and two

  number 1 and 2
  number 1 2 and 3
*/

const template ={
  "queries": [
    "food is countable",
    "bacon modifies deluxe",
    { priorities: [ { "context": [['bacon_deluxe', 0], ['list', 0]], "choose": [0] } ] },
    "chicken modifies sandwich",
    { priorities: [ { "context": [['chicken_sandwich', 0], ['list', 0]], "choose": [0] } ] },
    "premium modifies cod",
    { priorities: [ { "context": [['premium_cod', 0], ['list', 0]], "choose": [0] } ] },
    "ultimate chicken modifies grill",
    { priorities: [ { "context": [['ultimate_chicken_grill', 0], ['list', 0]], "choose": [0] } ] },
    // "10 piece modifies nuggets",
    "asiago ranch chicken modifies club",
    { priorities: [ { "context": [['asiago_ranch_chicken_club', 0], ['list', 0]], "choose": [0] } ] },
    "waffle modifies fries",
    { priorities: [ { "context": [['waffle_fry', 0], ['list', 0]], "choose": [0] } ] },
    "waffle fries are french fries",
    "mango modifies passion",
    "wild modifies berry",
    "strawberry modifies banana",
    "strawberry guava mango passion wild berry and strawberry banana modify smoothie",
    "a smoothie is a drink",
    "french fries and waffle fries are fries",
    "single double triple baconater and bacon deluxe are hamburgers",
    "spicy homestyle asiago ranch chicken club 10 piece nuggets ultimate chicken grill and premium cod are sandwiches",
    "a meals is food",
    "a combo is a meal",
    "single double triple baconater bacon deluxe spicy homestyle and premium cod are meals",
    {
      where: where(),
      operators: [
        "((meal/* && context.comboNumber == undefined) [comboMeal] (combo/*))",
        "((combo/*) [comboNumber] (number/* || numberNumberCombo/*))",
        "((numberNumberCombo/1) [numberNumberCombo_combo|] (combo/0))",
        "((number/0,1 && context.instance == undefined) [numberNumberCombo] (number/0,1))",
        "((combo/*) [([withFries|with] (fry/*))])",
      ],
      priorities: [
        { "context": [['number', 0], ['numberNumberCombo', 0], ], "choose": [0] },
        { "context": [['list', 0], ['numberNumberCombo', 0], ], "choose": [0] },
        // [['list', 0], ['comboNumber', 0], ],
        // [['comboNumber', 0], ['list', 0]],
        // this is just to learn associations and contextual_priorities I don't want the semantic to actually run
        // TODO make this learn cp#2 { query: "combo one and (2 combo twos)", skipSemantics: true },
        // TODO make this learn cp#1 { query: "(single and double) combo", skipSemantics: true },
        // cp#1
        { context: [['meal', 0], ['list',0], ['meal', 0], ['combo', 0]], ordered: true, choose: [0,1,2] },
        // cp#2
        // have a way of specifing this
        // { context: [['list',0], ['number', 0], ['combo', 0], ['number', 0]], ordered: true, choose: [comboNumber (in between 2 and 3)] },
        { context: [['list',0], ['number', 0], ['combo', 0], ['number', 0]], ordered: true, choose: [2,3] },
        { context: [['list',0], ['number', 1], ['combo', 0], ['number', 0]], ordered: true, choose: [2,3] },
        { context: [['list',0], ['number', 1], ['combo', 0], ['number', 1]], ordered: true, choose: [2,3] },
        /*
        { context: [['list',0], ['number', 0], ['combo', 0], ['number', 1]], choose: [1,2,3] },
        { context: [['list',0], ['number', 0], ['combo', 1], ['number', 1]], choose: [1,2,3] },
        { context: [['list',0], ['number', 1], ['combo', 1], ['number', 1]], choose: [1,2,3] },
        { context: [['list',0], ['number', 1], ['combo', 2]], choose: [1,2] },
        */
      ],
      generators: [
        {
          where: where(),
          match: ({context}) => false && context.marker == 'combo' && context.comboNumber,
          apply: ({context, g}) => g(context.comboNumber),
        }
      ],
      bridges: [
        { 
          id: 'withFries',
          level: 0,
          isA: ['preposition'],
          generatorp: ({context, gp}) => `with ${gp(context.modifications)}`,
          bridge: "{ ...next(operator), modifications: after[0] }",
        },
        { 
          id: 'withFries',
          level: 1,
          isA: ['preposition'],
          bridge: "{ ...next(before[0]), postModifiers: append(before[0].postModifiers, ['modifications']), modifications: operator }",
        },
        { 
          id: 'numberNumberCombo_combo',
          convolution: true,
          isA: ['food'],
          before: ['combo', 'counting'],
          bridge: "{ ...next(operator), modifiers: append(before[0].modifiers, ['comboNumber']), comboNumber: before[0], word: 'combo', flatten: true }",
        },
        { 
          id: 'comboMeal',
          convolution: true,
          before: ['meal', 'combo', 'counting'],
          bridge: "{ ...next(after[0]), modifiers: append(before[0].modifiers, ['type']), type: before[0], flatten: true }",
        },
        { 
          id: 'comboNumber',
          convolution: true,
          before: ['combo'],
          bridge: "{ ...next(before[0]), postModifiers: append(before[0].postModifiers, ['comboNumber']), comboNumber: after[0], instance: true, flatten: true }",
        },
        { 
          id: 'numberNumberCombo',
          convolution: true,
          isA: ['food'],
          before: ['combo', 'comboNumber'],
          bridge: "{ ...next(operator), word: 'number', combo: true, postModifiers: append(before[0].postModifiers, ['comboNumber']), comboNumber: after[0], flatten: true }",
        },
      ]
    },
  ],
}

class API {
  initialize({ objects, config }) {
    this._objects = objects
    this._objects.items = []
    this._objects.notAvailable = []
  }

  show() {
    this._objects.show = this._objects.items
  }

  add({ name, combo, modifications }) {
    this._objects.items.push({ name, combo, modifications })
  }

  say(response) {
    this._objects.response = response
  }

  // return true if you want the NLI layer to handle this
  hasAskedForButNotAvailable(item) {
    return this._objects.notAvailable.length > 0
  }

  getAskedForButNotAvailable(item) {
    const na = this._objects.notAvailable
    this._objects.notAvailable = []
    return na
  }

  addAskedForButNotAvailable(item) {
    this._objects.notAvailable.push(item)
  }

  isAvailable(id) {
    return [
      "double",
      "french_fry",
      "single",
      "triple",
      "waffle_fry",
    ].includes(id)
  }

  getCombo(number) {
    const map = {
      1: 'single',
      2: 'double',
      3: 'triple',
      4: 'baconater',
      5: 'bacon deluxe',
      6: 'spicy',
      7: 'homestyle',
      8: 'asiago range chicken club',
      9: 'ultimate chicken grill',
      10: '10 peice nuggets',
      11: 'premium cod',
    }
    return map[number]
  }
}

const api = new API()

class State {
  constructor(api) {
    this.api = api
  }

  add(food) {
    let quantity = 1
    if (food.quantity) {
      quantity = food.quantity.value
    }
    let name, combo
    if (food.comboNumber?.marker == 'numberNumberCombo') {
      name = this.api.getCombo(food.comboNumber.comboNumber.value)
      if (!name) {
        "some kind of error"
        return
      }
      combo = true
    }
    else if (food.comboNumber) {
      name = this.api.getCombo(food.comboNumber.value)
      if (!name) {
        "some kind of error"
        return
      }
      combo = true
    } else if (food.marker == 'combo') {
      name = food.type.value
      combo = true
    } else {
      name = food.value
      combo = !!food.combo
    }

    if (!this.api.isAvailable(name)) {
      this.api.addAskedForButNotAvailable(food)
      return
    }

    let modifications
    if (food.modifications) {
      modifications = []
      for (const addition of propertyToArray(food.modifications.modifications)) {
        modifications.push(addition.value)
      }
    }

    for (let i = 0; i < quantity; ++i) {
      this.api.add({ name, combo, modifications })
    }
  }

  // user ask what the order was
  show() {
    this.api.show()
  }

  say(response) {
    this.api.say(response)
  }
}

const createConfig = () => {
  const config = new Config({ 
    name: 'fastfood',
    operators: [
      "([orderNoun|order])",
      "([showOrder|show] ([orderNoun/1]))",
    ],
    // flatten: ['list'],
    // TODO use node naming not python

    priorities: [
      // { context: [['list', 0], ['bacon',0], ['deluxe', 0]], choose: [1,2] },
      { context: [['list', 0], ['food',0], ['combo', 0]], ordered: true, choose: [0,1] },
      { context: [['combo', 0], ['number', 0], ['list',0], ['number', 0]], ordered: true, choose: [1,2,3] },
      { context: [['combo', 0], ['comboNumber', 0], ['list', 1]], ordered: true, choose: [1] },
      { context: [['number', 0], ['numberNumberCombo', 0], ['list', 1]], ordered: true, choose: [1] },
      { context: [['number', 1], ['numberNumberCombo', 1], ['combo', 0]], ordered: true, choose: [2] },
      /*
      { context: [['list', 0], ['number', 0], ['combo', 0], ['number', 0]], choose: [1,2,3] },
      { context: [['list', 0], ['number', 1], ['combo', 0], ['number', 0]], choose: [1,2,3] },
      { context: [['list', 0], ['number', 1], ['combo', 0], ['number', 1]], choose: [1,2,3] },
      */
      { context: [['combo', 1], ['list', 0], ['number', 1], ['combo', 1]], ordered: true, choose: [2,3] },
      { context: [['list', 0], ['number', 1], ['combo', 1]], ordered: true, choose: [1,2] },
      // { context: [['list', 0], ['number', 1], ['combo', 0]], choose: [1, 2]},
      // { context: [['list', 0], ['combo', 0], ['number', 1]], choose: [1, 2]},
    ],
    semantics: [
      {
        where: where(),
        match: ({context, isAListable}) => isAListable(context, 'edible') && context.marker !== 'edible' && !context.same,
        apply: ({context, km, api, instance}) => {
          for (const element of propertyToArray(context)) {
            km('fastfood').api.state.add(element)
          }
        }
      },
      {
        where: where(),
        match: ({context, api}) => context.marker == 'controlEnd' && api.hasAskedForButNotAvailable(),
        apply: ({context, insert, api, gp, toContext}) => {
          const naArray = api.getAskedForButNotAvailable()
          naArray.forEach((f) => f.paraphrase = true)
          const naContext = toContext(naArray)
          naContext.isResponse = true
          naContext.verbatim = `The following are not menu items: ${gp(naContext)}`
          insert(naContext)
        }
      }
    ],
    bridges: [
      { 
        id: 'orderNoun',
        parents: ['noun', 'queryable'],
        evaluator: ({context, api}) => {
          context.evalue = { marker: 'list', value: api.objects.items }
          api.show()
        }
      },
      { 
        id: 'showOrder',
        parents: ['verby'],
        bridge: "{ ...next(operator), order: after[0] }",
        generatorp: ({context, g}) => `show ${g(context.order)}`,
        semantic: ({api}) => {
          api.state.show()
        },
      },
    ],
  }, module)
  config.add(edible())
  config.add(countable())
  config.add(events())
  config.api = api
  config.initializer( ({api}) => {
    api.state = new State(api)
  })
  return config
}

knowledgeModule( {
    module,
    description: 'fastfood related concepts',
    createConfig,
    test: {
            name: './fastfood.test.json',
            contents: fastfood_tests,
            checks: {
              objects: [
                'show', 
                'items', 
                'changes', 
                { property: 'notAvailable', filter: [ 'marker', 'value', 'text' ] }, 
                { property: 'quantity', filter: ['marker', 'value', 'text' ] },
              ],
              context: [
                ...defaultContextCheck,
                { property: 'comboNumber', filter: ['marker', 'value', 'text' ] },
              ],
            },
          },
    template: {
      template,
      instance: fastfood_instance,
    },
})
