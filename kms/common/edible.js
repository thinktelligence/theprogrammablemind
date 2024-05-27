const { Config, knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const hierarchy = require('./hierarchy')
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
  "queries": [
    "food and drinks are edible",
    "chicken modifies strips",
    "chicken strips are food",
    "sushi is food",
    "apples oranges and bananas are fruit",
    "hot modifies dog",
    "hot dogs are sausages",
    "sausages are meat",
    "french modifies fries",
    "french fries are food",
    "meat is food",
    "fruits are food",
    "sandwiches are food",
    "carrots peas cabbage and brocoli are vegetables",
    "vegetables are food",
    "a hamburger is a sandwich",
    "pop soda and juice are drinks",
  ],
}

const createConfig = () => {
  const config = new Config({ name: 'edible' }, module)
  config.add(hierarchy())
  return config
}

knowledgeModule( {
    module,
      description: 'Edible things',
      createConfig,
      test: {
              name: './edible.test.json',
              contents: edible_tests
            },
      template: {
        template,
        instance: edible_instance,
        checks: {
            context: defaultContextCheck,
          },

      },
})
