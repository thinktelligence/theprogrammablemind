const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const ordering_shop = require('./ordering_shop.js')
const coffee_shop_tests = require('./coffee_shop.test.json')
const instance = require('./coffee_shop.instance.json')

const template = {
  configs: [
    "coffee sizes are demi (mini/tiny), short (small), tall (medium), grande (large), venti (extra large), trenti (huge)",
    "espresso types are espresso, espresso macchiato, espresso con panna, americano, latte, cappuccino, flat white, mocha, caramel macchiato",
    "coffee is for sale",
  ],
}

knowledgeModule({ 
  config: { name: 'coffee_shop' },
  includes: [ordering_shop],

  module,
  description: 'Ordering from a coffee shop POC',
  test: {
    name: './coffee_shop.test.json',
    contents: coffee_shop_tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
  instance,
  template: {
    template,
  }
})
