const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const base_km = require('./hierarchy')
const countable = require('./countable')
const comparable = require('./comparable')
const tests = require('./pipboyTemplate.test.json')
const instance = require('./pipboyTemplate.instance.json')

const template = {
  queries: [
    "pistols rifles grenades mines and shotguns are weapons",
    "mines and grenades are explosives",
    "explosives are weapons",
    "pistols rifles and shotguns are firearms",
    "firearms are weapons",
    "hats armor and suits are clothes",
    // "a rifle is a weapon",
    //"a weapon is equipable and changeable"
    "a weapon is equipable",
    "clothes are wearable",
    // "weapons are countable",  TODO fix this
    "edible is a concept",
    "food is edible",
    "drinks are drinkable",
    "meat is food",
    "vegetables and fruit are food",
    "cola and pop are drinks",
    "medicine and stimpaks are takeable",
    "item modifies properties",
    "damage luck hp rads value ap charisma range and accuracy are item properties"
  ] 
}

const createConfig = () => new Config({ name: 'pipboyTemplate' }, module).add(base_km()).add(countable()).add(comparable())

knowledgeModule({ 
  module,
  description: 'Template for pipboy with speech',
  createConfig,
  template: { template, instance },
  test: {
    name: './pipboyTemplate.test.json',
    contents: tests,
    checks: {
            context: defaultContextCheck,
          },
  },
})
