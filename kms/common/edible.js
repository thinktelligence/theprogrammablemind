const { knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const hierarchy = require('./hierarchy')
const countable = require('./countable')
ensureTestFile(module, 'edible', 'test')
ensureTestFile(module, 'edible', 'instance')

const edible_tests = require('./edible.test.json')
const edible_instance = require('./edible.instance.json')

// fix this
// fix loading ordering not working

// fruit is food
// rotton fruit is not food
// rotton is a state of fruit
// ripe is a state of fruit

// x is 20              | fruit is food
// the value of x is 20 | fruit is a kind of food

const template ={
  configs: [
    "food and drinks are edible",
    "chicken modifies strips",
    "chicken modifies nugget",
    "nuggets, chicken strips and chicken nuggets are food",
    "sushi is food",
    "apples oranges and bananas are fruit",
    "hot modifies dog",
    "hot dogs are sausages",
    "sausages are meat",
    "french modifies fries",
    "fries are food",
    "meat is food",
    "fruits are food",
    "pie and salad are foods",
    "apple modifies pie",
    "sandwiches are food",
    "carrots, peas, cabbage, potatoes and broccoli are vegetables",
    "vegetables and bread are food",
    "french modifies toast",
    "muffins, french toast and pancakes are bread",
    "grain is a food",
    "cereal modifies grain",
    "oatmeal is a cereal grain",
    "sausage is a meat",
    "a hamburger is a sandwich",
    "a cheeseburger is a hamburger",
    "cheese is a food",
    "cheddar is a cheese",
    "milk, pop, soda, coffee, tea, shakes and juice are drinks",
    "apple modifies juice",
    "chocolate modifies milk",
    "lemonade is a drink",
    {
      hierarchy: [
        ['chicken_nugget', 'hasCountOfPieces'],
        ['nugget', 'hasCountOfPieces'],
      ],
      /* save for later?
      operators: [
        "((food/1) [compoundFood] (food/1))",
      ],
      bridges: [
        {
          id: 'compoundFood',
          convolution: true,
          bridge: "{ ...after, compound: before, modifiers: ['compound'] }",
        }
      ]
      */
    }
  ],
}

knowledgeModule( {
    config: { name: 'edible' },
    includes: [countable, hierarchy],
    module,
      description: 'Edible things',
      test: {
              name: './edible.test.json',
              contents: edible_tests,
              checks: {
                context: [defaultContextCheck()],
              }
            },
      instance: edible_instance,
      template: {
        template,
      },
})
