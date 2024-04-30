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
    // "more modifies big mac",
  ],
}

class API {
  initialize() {
    this.objects.items = [{ name: 'Whopper' }]
  }

  changed() {
    this.objects.changes = this.objects.items
  }

  say(response) {
    this.objects.response = response
  }
}
const api = new API()

class State {
  constructor(api) {
    this.api = api
    this.api.objects.items = [{ name: 'Whopper' }]
  }

  add(food) {
    // this.objects.items.push(food)
    // this.args.kms.events.api.happens({ marker: "changes", level: 1, changeable: this.objects.items })
    const name = food.value
    let quantity = 1
    if (food.quantity) {
      quantity = food.quantity.value
    }

    const existing = this.api.objects.items.find( (item) => item.name == name )
    if (existing) {
      existing.quantity = quantity
    } else {
      this.api.objects.items.push({ name, quantity })
    }
    this.api.changed()
  }

  // user ask what the order was
  show() {
    this.api.objects.show = this.api.objects.items
  }

  say(response) {
    this.api.say(response)
  }

  order() {
    return this.api.objects.items
  }
}

const config = new Config({ 
  name: 'fastfood',
  operators: [
    "([orderNoun|order])",
    "([showOrder|show] ([orderNoun/1]))",
  ],
  contextual_priorities: [
    { context: [['list', 0], ['bacon',0], ['deluxe', 0]], choose: [1,2] },
    { context: [['list', 0], ['spicy',0], ['homestyle', 0]], choose: [1,2] },
    { context: [['list', 0], ['premium',0], ['cod', 0]], choose: [1,2] },
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
config.initializer( ({motivation, km}) => {
  // this.state = new State(config.api)
  // const api = baseConfig.getConfig('fastfood').api
  const config = km('fastfood')
  config.api.state = new State(config.api)
  /*
  ask([
  {
    where: where(),
    matchq: ({objects}) => !objects.winningScore,
    applyq: () => 'What did you want?',
    matchr: ({context}) => context.marker == 'food',
    applyr: ({context, objects}) => {
      // add to order
    }
  }
  */
  motivation({
    repeat: true,
    where: where(),
    match: ({context, isA}) => isA(context.marker, 'food'),
    apply: ({context, km, api}) => {
      // config.state.add(context)
      // km('fastfood').state.add(context)
      km('fastfood').api.state.add(context)
    }
  })

})

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
