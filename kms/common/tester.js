const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const tester_tests = require('./tester.test.json')
const ArgumentParser = require('argparse').ArgumentParser

const testModuleNameFn = () => {
  const parser = new ArgumentParser({ description: 'Get test module name' })
  parser.add_argument('-tmn', '--testModuleName', { help: 'List of module to run the tests from' })
  const [args, unknown] = parser.parse_known_args()
  return args.testModuleName
}
const testModuleName = testModuleNameFn()

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
  for (const module of args.modules.split(',')) {
    global.theprogrammablemind.loadForTesting[module] = true
    const km = require(`./${module}`)
    // km.rebuild({ isModule: false }) // load the usually defaults
    await config.add(km)
  }
  return config
}

global.theprogrammablemind = {
  loadForTesting: {}
}

const includes = args.modules.split(',').map((module) => {
  global.theprogrammablemind.loadForTesting[module] = true
  const km = require(`./${module}`)
  return km
})

const fixtures = async (args) => {
  const { config, kms, apis } = args;
  if (kms[testModuleName].testConfig?.fixtures) {
    const fixtures = kms.menus.testConfig?.fixtures
    kms.menus.testConfig.fixtures = null
    const testModuleApi = apis(testModuleName)
    const objects = testModuleApi._objects
    args.objects = objects
    await fixtures({ ...args, objects, api: testModuleApi })
    kms.menus.testConfig.fixtures = fixtures
  }
}

knowledgeModule({
  config: { name: 'tester' },
  includes,

  module,
  description: 'Testing modules loaded together',
  test: {
    name: './tester.test.json',
    contents: tester_tests,
    fixtures,
  },
})
