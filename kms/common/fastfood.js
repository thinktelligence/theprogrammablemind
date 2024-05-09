const { Config, knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
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
    /*
    "big modifies mac",
    "a big mac is a hamburger",
    "quarter modifies pounder",
    "a quarter pounder is a hamburger",
    */
    "bacon modifies deluxe",
    "chicken modifies sandwich",
    "premium modifies cod",
    "spicy modifies homestyle",
    "single double triple baconater and bacon deluxe are hamburgers",
    "spicy homestyle and premium cod are sandwiches",
    "a meals is food",
    "a combo is a meal",
    "single double triple baconater bacon deluxe spicy homestyle and premium cod are meals",
    // "more modifies big mac",
    {
      where: where(),
      operators: [
        "((meal/0,1 && !comboNumber ) [comboMeal] (combo/0))",
        "((combo/0) [comboNumber] (number/0,1))",
        // "( (number/0 && value='number') [numberNumberCombo] (number/0))",
        // "((combo/0) (number/1) [comboNumberNumber] (number/1))",
        "((number/0,1) [numberNumberCombo] (number/0,1))",
      ],
      bridges: [
        { 
          id: 'comboMeal',
          convolution: true,
          before: ['meal', 'combo'],
          // bridge: "{ ...before[0], combo: true, postModifiers: append(before[0].postModifiers, ['combo']), combo: after[0], flatten: true }",
          bridge: "{ ...next(after[0]), modifiers: append(before[0].modifiers, ['type']), type: before[0], flatten: true }",
        },
        { 
          id: 'comboNumber',
          convolution: true,
          before: ['meal', 'combo'],
          // bridge: "{ ...before[0], combo: true, postModifiers: append(before[0].postModifiers, ['combo']), combo: after[0], flatten: true }",
          bridge: "{ ...next(before[0]), postModifiers: append(before[0].modifiers, ['comboNumber']), comboNumber: after[0], flatten: true }",
        },
        { 
          id: 'numberNumberCombo',
          convolution: true,
          before: ['meal', 'combo', 'comboNumber'],
          // bridge: "{ ...before[0], combo: true, postModifiers: append(before[0].postModifiers, ['combo']), combo: after[0], flatten: true }",
          bridge: "{ marker: operator('combo', 0), postModifiers: append(before[0].modifiers, ['comboNumber']), comboNumber: after[0], flatten: true }",
        },
        /*
        { 
          id: 'comboNumberNumber',
          convolution: true,
          before: ['meal', 'combo'],
          // bridge: "{ ...before[0], combo: true, postModifiers: append(before[0].postModifiers, ['combo']), combo: after[0], flatten: true }",
          bridge: "{ marker: operator('combo', 0), postModifiers: append(before[0].modifiers, ['number']), comboNumber: after[0], flatten: true }",
        },
        */
      ]
    }
  ],
}

class API {
  initialize({ objects }) {
    this._objects = objects
    // this.objects.items = []
    this._objects.items = []

    this.state = new State(this)
  }

  changed() {
    this._objects.changes = this._objects.items
  }

  say(response) {
    this._objects.response = response
  }

  getCombo(number) {
    const map = {
      1: 'single',
      2: 'double',
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
    if (food.comboNumber) {
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

    for (let i = 0; i < quantity; ++i) {
      this.api._objects.items.push({ name, combo })
    }
    this.api.changed()
  }

  // user ask what the order was
  show() {
    this.api._objects.show = this.api._objects.items
  }

  say(response) {
    this.api.say(response)
  }

  order() {
    return this.api._objects.items
  }
}

const config = new Config({ 
  name: 'fastfood',
  operators: [
    "([orderNoun|order])",
    "([showOrder|show] ([orderNoun/1]))",
  ],
  // flatten: ['list'],
  contextual_priorities: [
    { context: [['list', 0], ['bacon',0], ['deluxe', 0]], choose: [1,2] },
    { context: [['list', 0], ['spicy',0], ['homestyle', 0]], choose: [1,2] },
    { context: [['list', 0], ['premium',0], ['cod', 0]], choose: [1,2] },
    { context: [['list', 0], ['food',0], ['combo', 0]], choose: [0,1] },
    { context: [['combo', 0], ['number', 0], ['list',0], ['number', 0]], choose: [1,2,3] },
    { context: [['combo', 0], ['comboNumber', 0], ['list', 1]], choose: [1] },
    { context: [['number', 0], ['numberNumberCombo', 0], ['list', 1]], choose: [1] },
  ],
  semantics: [
    {
      where: where(),
      match: ({context, isA}) => isA(context.marker, 'food') && context.marker !== 'food',
      apply: ({context, km, api}) => {
        // config.state.add(context)
        // km('fastfood').state.add(context)
        km('fastfood').api.state.add(context)
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
config.add(foods)
config.add(countable)
config.add(events)
config.api = api

knowledgeModule( {
    module,
    description: 'fastfood related concepts',
    config,
    test: {
            name: './fastfood.test.json',
            contents: fastfood_tests,
            check: [
              'show', 'items', 'changes'
            ]
          },
    template: {
      template,
      instance: fastfood_instance,
    },
})
