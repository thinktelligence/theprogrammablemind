const { Config, knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck, propertyToArray } = require('./helpers')
const foods = require('./foods')
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
    { priorities: [ [['bacon_deluxe', 0], ['list', 0], ] ] },
    "chicken modifies sandwich",
    { priorities: [ [['chicken_sandwich', 0], ['list', 0], ] ] },
    "premium modifies cod",
    { priorities: [ [['premium_cod', 0], ['list', 0], ] ] },
    "ultimate chicken modifies grill",
    { priorities: [ [['ultimate_chicken_grill', 0], ['list', 0], ] ] },
    // "10 piece modifies nuggets",
    "asiago ranch chicken modifies club",
    { priorities: [ [['asiago_ranch_chicken_club', 0], ['list', 0], ] ] },
    "waffle modifies fries",
    { priorities: [ [['waffle_fry', 0], ['list', 0], ] ] },
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
        [['number', 0], ['numberNumberCombo', 0], ],
        [['list', 0], ['numberNumberCombo', 0], ],
        [['list', 0], ['comboNumber', 0], ],
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
          bridge: "{ ...next(before[0]), postModifiers: append(before[0].modifiers, ['comboNumber']), comboNumber: after[0], instance: true, flatten: true }",
        },
        { 
          id: 'numberNumberCombo',
          convolution: true,
          isA: ['food'],
          before: ['combo', 'comboNumber'],
          bridge: "{ ...next(operator), word: 'number', combo: true, postModifiers: append(before[0].postModifiers, ['comboNumber']), comboNumber: after[0], flatten: true }",
        },
      ]
    }
  ],
}

class API {
  initialize({ objects, config }) {
    this._objects = objects
    this._objects.items = []
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

  isAvailable(id) {
    return [
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
    // this.api.objects.items = []
  }

  add(food) {
    debugger
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
    contextual_priorities: [
      // { context: [['list', 0], ['bacon',0], ['deluxe', 0]], choose: [1,2] },
      { context: [['list', 0], ['food',0], ['combo', 0]], choose: [0,1] },
      { context: [['combo', 0], ['number', 0], ['list',0], ['number', 0]], choose: [1,2,3] },
      { context: [['combo', 0], ['comboNumber', 0], ['list', 1]], choose: [1] },
      { context: [['number', 0], ['numberNumberCombo', 0], ['list', 1]], choose: [1] },
      { context: [['number', 1], ['numberNumberCombo', 1], ['combo', 0]], choose: [2] },
      { context: [['list', 0], ['number', 0], ['combo', 0], ['number', 0]], choose: [1,2,3] },
      { context: [['list', 0], ['number', 1], ['combo', 0], ['number', 0]], choose: [1,2,3] },
      { context: [['list', 0], ['number', 1], ['combo', 0], ['number', 1]], choose: [1,2,3] },
      { context: [['combo', 1], ['list', 0], ['number', 1], ['combo', 1]], choose: [2,3] },
    ],
    semantics: [
      {
        where: where(),
        match: ({context, isAListable}) => isAListable(context, 'food') && context.marker !== 'food' && !context.same,
        apply: ({context, km, api, instance}) => {
          for (const element of propertyToArray(context)) {
            km('fastfood').api.state.add(element)
          }
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
  config.add(foods())
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
                'show', 'items', 'changes'
              ],
              context: defaultContextCheck,
            },
          },
    template: {
      template,
      instance: fastfood_instance,
    },
})
