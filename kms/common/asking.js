const { knowledgeModule, where, stableId } = require('./runtime').theprogrammablemind
const meta = require('./meta.js')
const gdefaults = require('./gdefaults.js')
const sdefaults = require('./sdefaults.js')
const conjunction = require('./conjunction.js')
const asking_tests = require('./asking.test.json')
const { defaultObjectCheck, defaultContextCheck, indent, focus, requiredArgument } = require('./helpers')
const pluralize = require('pluralize')

// TODO implement what / what did you say ...
const config = {
  name: 'asking',
  operators: [
    "([nevermind])",
    { pattern: "([nevermindTestSetup] (allowed))", scope: "testing" },
    { pattern: "([whichOnesTestSetup] (choices)*)", scope: "testing" },
  ],
  bridges: [
    {
      id: "nevermind",
      bridge: "{ ...next(operator), complete: true }",
      semantic: (args) => {
        const {config, context} = args
        // stop asking all questions
        for (const semantic of config.semantics) {
          if (semantic.isQuestion) {
            let doRemove = true
            if (semantic.onNevermind && semantic.getWasAsked() && !semantic.getWasApplied()) {
              doRemove = semantic.onNevermind(args)
            }
            if (doRemove) {
              config.removeSemantic(semantic)
            }
          }
        }
      }
    },

    {
      id: "whichOnesTestSetup",
      scope: "testing",
      generatorp: async ({context, gs}) => `${context.marker} ${await gs(context.choices)}`,
      bridge: "{ ...next(operator), choices: after[0] }",
      semantic: ({askWhich, context}) => {
        const choices = context.choices
        function chosen({ choice, objects }) {
          objects.choice = choice
        }

        async function question({choices, g, gs, wasAsked, state}) {
          if (wasAsked) {
            return `${await g(state.lastChoice)} is not a choice. The choices are: ${await gs(choices, ' ', ' or ')}`
          } else {
            return `Which value do you want: ${await gs(choices, ' ', ' or ')}`
          }
        }

        function isChoice({context, choices, state}) {
          state.lastChoice = context
          for (const choice of choices) {
            if (choice.value == context.value) {
              return true
            }
          }
        }

        function onNevermind({objects, context}) {
          objects.onNevermindWasCalled = true
          return true
        }

        askWhich({ choices, chosen, question, isChoice, onNevermind })
      }
    },

    {
      id: "nevermindTestSetup",
      scope: "testing",
      bridge: "{ ...next(operator), type: after[0], postModifiers: ['type'] }",
      semantic: ({ask, context}) => {
        const nevermindType = context.type.value
        ask({
          applyq: () => 'the test question?',
          onNevermind: ({objects, context}) => {
            objects.onNevermindWasCalled = true
            objects.nevermindType = nevermindType
            return nevermindType == 'accept'
          },
          matchr: () => false,
          applyr: () => {},
        })
      }
    },
  ],
};

function getAsk(config) {
    return (uuid) => {
      return (asks) => {
      function ask(ask, s_ids) {
        let oneShot = true // default
        if (ask.oneShot === false) {
          oneShot = false
        }

        const id_q = stableId('semantic')
        s_ids.push(id_q)
        const id_rs = []
        let wasAsked = false
        let wasApplied = false
        function getWasAsked() {
          return wasAsked
        }
        function setWasAsked(value) {
          wasAsked = value
        }
        function getWasApplied() {
          return wasApplied
        }
        function setWasApplied(value) {
          wasApplied = value
        }

        const semanticsr = ask.semanticsr || []
        if (semanticsr.length == 0) {
          semanticsr.push({ match: ask.matchr, apply: ask.applyr })
        }
        for (const semantic of semanticsr) {
          const id_r = stableId('semantic')
          id_rs.push(id_r)
          s_ids.push(id_r)
          config.addSemantic({
            uuid,
            id: id_r,
            tied_ids: [id_q],
            // tied_ids: s_ids,
            onDelete: ask.onDelete,
            oneShot,
            where: semantic.where || ask.where || where(2),
            source: 'response',
            match: (args) => semantic.match(args),
            apply: async (args) => {
              setWasApplied(true)
              await semantic.apply(args)
            },
          })
        }

        config.addSemantic({
          uuid,
          oneShot,
          id: id_q,
          tied_ids: id_rs,
          // tied_ids: s_ids,
          where: ask.where,
          isQuestion: true,  // do one question at a time
          getWasAsked,
          getWasApplied,
          onDelete: ask.onDelete,
          onNevermind: ask.onNevermind,
          source: 'question',
          match: ({ context }) => context.marker == 'controlEnd' || context.marker == 'controlBetween',
          apply: async (args) => {
            let matchq = ask.matchq
            let applyq = ask.applyq
            if (!matchq) {
              let wasAsked = false
              matchq = () => !wasAsked,
              applyq = (args) => {
                wasAsked = true
                return ask.applyq(args)
              }
            }
            if (await matchq(args)) {
              setWasApplied(false)
              // args.context.motivationKeep = true
              const query = await applyq({ ...args, wasAsked: getWasAsked() })
              if (typeof query != 'string') {
                throw new Error(`ask expects the value return from applyq to be a string. ${ask.where}`)
              }
              args.verbatim(query)
              setWasAsked(true)
              args.context.controlKeepMotivation = true
            } else {
              args._continue()
            }
            args.context.cascade = true
          }
        })
      }
      if (!Array.isArray(asks)) {
        asks = [asks]
      }

      const s_ids = []
      for (const a of [...asks].reverse()) {
        // debugger
        ask(a, s_ids)
      }
      
      function cleanUp() {
        config.removeSemantic(s_ids)
      }
      return cleanUp
    }
  }
}


function initializer({objects, config, isModule}) {
  config.addArgs(({config, api, isA}) => ({ 
    getUUIDScoped: (uuid) => { 
      const ask = getAsk(config)(uuid)
      return {
        ask,
        askWhich: ({ choices, chosen, question, isChoice, onNevermind }) => {
          const state = {}

          requiredArgument(choices, 'choices')
          requiredArgument(chosen, 'chosen')

          if (!onNevermind) {
            onNevermind = ({objects, context}) => {
              return true
            }
          }

          if (!question) {
            async function question({choices, g, gs, wasAsked, state}) {
              if (wasAsked) {
                return `${await g(state.lastChoice)} is not a choice. The choices are: ${await gs(choices, ' ', ' or ')}`
              } else {
                return `Which value do you want: ${await gs(choices, ' ', ' or ')}`
              }
            }
          }

          if (!isChoice) {
            function isChoice({context, choices, state}) {
              state.lastChoice = context
              for (const choice of choices) {
                if (choice.value == context.value) {
                  return true
                }
              }
            }
          }

          ask({
            applyq: async (args) => await question({...args, choices, state}),
            onNevermind,
            matchr: (args) => isChoice({...args, choices, state}),
            applyr: (args) => chosen({...args, choice: args.context}),
          })
        }
      } 
    },
  }))
}

knowledgeModule( { 
  config,
  includes: [conjunction, gdefaults, sdefaults],
  initializer,
  module,
  description: 'asking the user questions',
  newWay: true,
  test: {
    name: './asking.test.json',
    contents: asking_tests,
    checks: {
      ...defaultObjectCheck(['onNevermindWasCalled', 'nevermindType', 'choice']),
      context: [
        defaultContextCheck(),
      ],
    },
  },
})
