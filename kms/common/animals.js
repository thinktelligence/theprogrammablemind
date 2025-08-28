const { defaultContextCheck } = require('./helpers')
const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const hierarchy = require('./hierarchy')
const animals_tests = require('./animals.test.json')
const animals_instance = require('./animals.instance.json')

const template = {
  configs: [
    "birds and mammals are animals",
    "mammals have ears",
    "mammals have hair",
    "mammals dont have wings",
    "animals have skin",
    "animals have eyes",
    "birds have wings",
    "birds have beaks",
    "humans bats felines and canines are mammals",
    "owls eagles pidgeons and parrots are birds",
    "cats are felines",
    "dogs and wolves are canines",
    "bats have wings",
    // TODO "all kinds of animals are readonly"
    // TODO "is a dog a type of mammal"
    // TODO "x is not a y"
  ],
}

knowledgeModule( {
    config: { name: 'animals' },
    includes: [hierarchy],

    module,
    description: 'animals related concepts',
    newWay: true,
    test: {
            name: './animals.test.json',
            contents: animals_tests,
            checks: {
              context: [defaultContextCheck()],
            }
          },
    template: {
      template,
      instance: animals_instance
    }
})
