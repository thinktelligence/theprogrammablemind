const { Config, knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
const hierarchy = require('./hierarchy')
ensureTestFile(module, 'foods', 'test')
ensureTestFile(module, 'foods', 'instance')

const foods_tests = require('./foods.test.json')
const foods_instance = require('./foods.instance.json')

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
  ],
}

const createConfig = () => {
  const config = new Config({ name: 'foods' }, module)
  config.add(hierarchy())
  // config.load(template, foods_instance)
  return config
}

knowledgeModule( {
    module,
      description: 'foods related concepts',
      createConfig,
      test: {
              name: './foods.test.json',
              contents: foods_tests
            },
      template: {
        template,
        instance: foods_instance,
      },
})
