const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const tester_tests = require('./tester.test.json')
const ArgumentParser = require('argparse').ArgumentParser

const parser = new ArgumentParser({
  description: 'Test modules together'
})

parser.add_argument('-m', '--module', { help: 'The module to test rebuilding on' })
const [args, unknown] = parser.parse_known_args();

(async () => {
  console.time(`make ${args.module}`)
  const createKM = require(`./${args.module}`)
  const km = await createKM()
  console.timeEnd(`make ${args.module}`)
  console.time(`rebuild ${args.module}`)
  await km.rebuild()
  console.timeEnd(`rebuild ${args.module}`)
  console.time(`make ${args.module}`)
  await createKM()
  console.timeEnd(`make ${args.module}`)
})().catch( (e) => {
  console.log("ERROR", e)
  process.exit(-1)
})
