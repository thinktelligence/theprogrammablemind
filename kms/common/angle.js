const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dimension = require('./dimension.js')
const angle_tests = require('./angle.test.json')
const instance = require('./angle.instance.json')

const template = {
  configs: [
    "angle is a dimension",
    "degrees and radians are units of angle",
    "degrees = radians * 180 / pi",
    "radians = degrees * pi / 180",
  ],
}

knowledgeModule({ 
  config: { name: 'angle' },
  includes: [dimension],

  module,
  description: 'Angle measurements',
  test: {
    name: './angle.test.json',
    contents: angle_tests,
    checks: {
      objects: [
        { km: 'dimension' },
        { km: 'stm' },
      ],
      context: [defaultContextCheck()],
    }
  },
  instance,
  template,
})
