const { knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const hierarchy = require('./hierarchy')
ensureTestFile(module, 'emotions', 'test')
ensureTestFile(module, 'emotions', 'instance')
const emotions_tests = require('./emotions.test.json')
const instance = require('./emotions.instance.json')

/*
anger/angry
happiness/happy
okay/happy
boredom/bored
*/

const template ={
  configs: [
    // "neutral anger happiness and boredom are concepts",
    // "neutral anger happiness and boredom are emotions",
    // TODO add an invert for mapping generator to "sb feels e"
    "sentientBeing1 feels emotion1 means the emotion of sentientBeing1 is emotion1",
    //"greg feels angry", 
  ],
}

const config = { 
  name: 'emotions',
  operators: [
    "([sentientBeing|])",
    "([emotion|])",
  ],
  bridges: [
    { id: 'sentientBeing' },
    // just here so it loads and the sentence can make the semantics
    // { id: 'feel', level: 0, bridge: '{ ...next(operator) }' },
    { id: 'emotion' },
  ],
  priorities: [
    { "context": [['feel', 0], ['means', 0], ], "choose": [0] },
  ],
}

function initializer({config, apis}) {
  const api = apis('properties')
  api.createActionPrefix({
                operator: 'feel',
                create: ['feel'/*, 'emotion'*/],
                before: [{tag: 'sentientBeing', id: 'sentientBeing'}],
                after: [{tag: 'emotion', id: 'emotion'}],
                localHierarchy: [
                  ['unknown', 'emotion'],
                  ['unknown', 'sentientBeing'],
                ],
                doAble: true,
                config })
}

knowledgeModule( {
    config,
    includes: [hierarchy],
    initializer,

    module,
      description: 'emotions related concepts',
      test: {
              name: './emotions.test.json',
              contents: emotions_tests,
              checks: {
                context: [defaultContextCheck()],
              }
            },
      instance,
      template,
})
