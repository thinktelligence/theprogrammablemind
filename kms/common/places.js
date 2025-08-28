const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const hierarchy = require('./hierarchy')
const animals_tests = require('./places.test.json')
const animals_instance = require('./places.instance.json')

const template ={
  configs: [
    "regina, saskatoon and vancouver are cities",
    "regina and saskatoon are in saskatchewan",
    "british modifies columbia",
    "vancouver is in british columbia",
    "saskatchewan and british columbia are provinces of canada",
    "canada is a country",
  ],
}

const createConfig = async () => {
  const config = new Config({ name: 'places' }, module)
  await config.add(hierarchy)
  return config
}

knowledgeModule( {
    module,
      description: 'places related concepts',
      createConfig,
      test: {
              name: './places.test.json',
              contents: animals_tests
            },
      template: {
        template,
        instance: animals_instance
      }
})
