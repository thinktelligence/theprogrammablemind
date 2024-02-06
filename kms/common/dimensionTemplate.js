const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const hierarchy = require('./hierarchy')
const dimensionTemplate_tests = require('./dimensionTemplate.test.json')
const dimensionTemplate_instance = require('./dimensionTemplate.instance.json')

const template = {
  queries: [
    "dimension and unit are concepts",
  ],
}

const config = new Config({ name: 'dimensionTemplate' }, module)
config.add(hierarchy)

knowledgeModule( {
    module,
      description: 'template for dimension',
      config,
      test: {
              name: './dimensionTemplate.test.json',
              contents: dimensionTemplate_tests
            },
      template: {
        template,
        instance: dimensionTemplate_instance
      }
})
