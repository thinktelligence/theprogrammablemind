const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const hierarchy = require('./hierarchy')
const people_tests = require('./people.test.json')
const people_instance = require('./people.instance.json')
const { hashIndexesGet, hashIndexesSet, translationMapping, translationMappings, compose } = require('./helpers/meta.js')


// TODO first name 
// TODO last name
// alive is a first name vs alive is a person
// TODO who is the person that owns cleo

const template = {
    queries: [
      "first modifies name",
      "last modifies name",
      "surname means last name",
      "given modifies name",
      "given name means first name",
      "ownee is owned by owner means owner owns ownee",
//      "the first name of greg is greg23",
//      "ownee23 is owned by owner23",
//      "cleo is a cat",
//      "wendy owns cleo",
    ],
}
let config = {
  name: 'people',
  operators: [
    "([person|person,people])",
    /*
    "([personOp] ([first_name]))",
    "([personOp] ([last_name]))",
    "([personOp] ([salutation]) ([last_name]))",
    "([personOp] ([first_name]) ([last_name]))",
    "([personOp] ([first_name]) ([middle_name]) ([last_name]))",
    */
  ],
  bridges: [
    { id: 'person', level: 0, bridge: '{ ...next(operator) }' },
  ],
  hierarchy: [
    ['person', 'unknown'],
  ],
};

config = new Config(config, module)
config.add(hierarchy)
config.initializer( ({config, context, km, isAfterApi, isModule}) => {
  if (!isAfterApi) {
    return 
  }
  const api = km('properties').api
  // setup paraphrase
  api.createActionPrefix({
            operator: 'owns',
            word: { singular: 'owns', plural: 'own' },
            create: ['owns', 'owner', 'ownee'],
            before: [{tag: 'owner', id: 'owner'}],
            after: [{tag: 'ownee', id: 'ownee'}],
            relation: true,
            localHierarchy: [['unknown', 'owner'], ['object', 'owner'], ['unknown', 'ownee'], ['object', 'ownee']],
            doAble: true,
            edAble: { operator: 'owned', word: 'owned' },
            config
          })

}, { initAfterApi: true })

knowledgeModule( { 
  module,
  description: 'about people',
  config,
  test: {
    name: './people.test.json',
    contents: people_tests
  },
  template: {
    template,
    instance: people_instance
  },
})
