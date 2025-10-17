const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const hierarchy = require('./hierarchy')
const people_tests = require('./people.test.json')
const people_instance = require('./people.instance.json')
const { hashIndexesGet, hashIndexesSet, translationMapping, translationMappings, compose } = require('./helpers/meta.js')


// TODO first name 
// TODO last name
// alive is a first name vs alive is a person
// TODO who is the person that owns cleo

const template = {
    configs: [
      "first modifies name",
      "last modifies name",
      "surname means last name",
      "given modifies name",
      "given name means first name",
      { stop: true },
      "ownee is owned by owner means owner owns ownee",
    ],
}
const config = {
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

const initializer = ({baseConfig, context, apis, isModule}) => {
    // const api = km('properties').api
    const api = apis('properties')
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
              config: baseConfig
            })
  }

knowledgeModule( { 
  config,
  includes: [hierarchy],
  initializer,

  module,
  description: 'about people',
  test: {
    name: './people.test.json',
    contents: people_tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
  template: {
    template,
    instance: people_instance
  },
})
