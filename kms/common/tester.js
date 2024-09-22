const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const tester_tests = require('./tester.test.json')
const ArgumentParser = require('argparse').ArgumentParser

const parser = new ArgumentParser({
  description: 'Test modules together'
})

parser.add_argument('-m', '--modules', { help: 'List of modules to load' })
const [args, unknown] = parser.parse_known_args()

process.argv = [process.argv[0], process.argv[1], ...unknown]

const createConfig = async () => {
  const config = new Config({ name: 'tester' })
  global.theprogrammablemind = {
    loadForTesting: {}
  }
  for (let module of args.modules.split(',')) {
    global.theprogrammablemind.loadForTesting[module] = true
    const km = require(`./${module}`)
    // km.rebuild({ isModule: false }) // load the usually defaults
    await config.add(km)
  }
  return config
}

knowledgeModule({
  module,
  description: 'Testing modules loaded together',
  createConfig,
  test: {
    name: './tester.test.json',
    contents: tester_tests
  },
})
