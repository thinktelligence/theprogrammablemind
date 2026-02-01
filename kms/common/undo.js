const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck, words } = require('./helpers')
const stm = require('./stm')
const undo_tests = require('./undo.test.json')
const instance = require('./undo.instance.json')

const template = {
  configs: [
    {
      operators: [
        "([undo_undo|undo])",
        "([action_undo])",
      ],
      bridges: [
        // TODO needs work around multiple undo calls and not calling already undon stuff
        {
          id: 'undo_undo',
          semantic: (args) => {
            const { mentions } = args
            const action = mentions({ context: { marker: 'action_undo' } })
            action.undo(args)
          }
        },
        {
          id: 'action_undo',
          words: words('action'),
          scope: "testing",
          semantic: ({ context, mentioned, isModule }) => {
            if (!isModule) {
              mentioned({ context })
              context.undo = ({objects}) => objects.undone = context
            }
          }
        }
      ],
    }
  ]
}

async function createConfig() {
  const config = new Config({ name: 'undo' }, module)
  config.stop_auto_rebuild()
    await config.add(stm)
  await config.restart_auto_rebuild()
  return config
}

knowledgeModule({ 
  module,
  description: 'Control a undo/redos',
  createConfig,
  instance,
  template: { template },
  test: {
    name: './undo.test.json',
    contents: undo_tests,
    checks: {
      objects: [
        'undone',
        { km: 'stm' },
      ],
      context: [
        defaultContextCheck(),
      ]
    },
  },
})
