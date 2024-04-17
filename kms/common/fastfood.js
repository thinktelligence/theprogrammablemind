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
  i want 2 hamburgers -> what kind?
    big mac
    big mac quarter pounder
*/

const template ={
  "queries": [
    "food is countable",
    "big modifies mac",
    "a big mac is a hamburger",
    "quarter modifies pounder",
    "a quarter pounder is a hamburger",
    // "more modifies big mac",
  ],
}

class API {
  initialize() {
    this.objects.items = []
  }

  add(food) {
    // this.objects.items.push(food)
    // this.args.kms.events.api.happens({ marker: "changes", level: 1, changeable: this.objects.items })
    const name = food.value
    let quantity = 1
    if (food.quantity) {
      quantity = food.quantity.value
    }

    const existing = this.objects.items.find( (item) => item.name == name )
    if (existing) {
      existing.quantity = quantity
    } else {
      this.objects.items.push({ name, quantity })
    }
  }

  // user ask what the order was
  show() {
    this.objects.show = this.objects.items
  }
}
const api = new API()

const config = new Config({ 
  name: 'fastfood',
  operators: [
    "([orderNoun|order])",
    "([showOrder|show] ([orderNoun/1]))",
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
        api.show()
      },
    },
  ],
}, module)
config.add(foods)
config.add(countable)
config.add(events)
config.api = api
config.initializer( ({motivation}) => {
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
    match: ({context, kms, isA}) => {
      return isA(context.marker, 'food')
    },
    apply: ({context, api}) => {
      debugger;
      api.add(context)
    }
  })

})

knowledgeModule( {
    module,
      description: 'fastfood related concepts',
      config,
      test: {
              name: './fastfood.test.json',
              contents: fastfood_tests
            },
      template: {
        template,
        instance: fastfood_instance,
      },
      check: [
        'show', 'items',
      ]
})
