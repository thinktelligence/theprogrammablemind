const { knowledgeModule, where, stableId } = require('./runtime').theprogrammablemind
const meta = require('./meta.js')
const gdefaults = require('./gdefaults.js')
const sdefaults = require('./sdefaults.js')
const conjunction = require('./conjunction.js')
const asking_tests = require('./asking.test.json')
const { defaultContextCheck, indent, focus, requiredArgument } = require('./helpers')
const pluralize = require('pluralize')

// TODO implement what / what did you say ...
let config = {
  name: 'asking',
  operators: [
    "([nevermind])",
    { pattern: "([nevermindTestSetup] (allowed))", development: true },
    { pattern: "([whichOnesTestSetup] (choices)*)", development: true },
  ],
  bridges: [
    {
      id: "nevermind",
      bridge: "{ ...next(operator) }",
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
      development: true,
      generatorp: async ({context, gs}) => `${context.marker} ${await gs(context.choices)}`,
      bridge: "{ ...next(operator), choices: after }",
      semantic: ({askWhich, context}) => {
        const choices = context.choices
        const chosen = ({ choice, objects }) => {
          objects.choice = choice
        }

        const question = async ({choices, g, gs, wasAsked, state}) => {
          if (wasAsked) {
            return `${await g(state.lastChoice)} is not a choice. The choices are: ${await gs(choices, ' ', ' or ')}`
          } else {
            return `Which value do you want: ${await gs(choices, ' ', ' or ')}`
          }
        }

        const isChoice = ({context, choices, state}) => {
          state.lastChoice = context
          for (const choice of choices) {
            if (choice.value == context.value) {
              return true
            }
          }
        }

        const onNevermind = ({objects, context}) => {
          objects.onNevermindWasCalled = true
          return true
        }

        askWhich({ choices, chosen, question, isChoice, onNevermind })
      }
    },

    {
      id: "nevermindTestSetup",
      development: true,
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

const getAsk = (config) => (uuid) => {
    return (asks) => {
    const ask = (ask) => {
      let oneShot = true // default
      if (ask.oneShot === false) {
        oneShot = false
      }

      const id_q = stableId('semantic')
      const id_rs = []
      let wasAsked = false
      let wasApplied = false
      const getWasAsked = () => {
        return wasAsked
      }
      const setWasAsked = (value) => {
        wasAsked = value
      }
      const getWasApplied = () => {
        return wasApplied
      }
      const setWasApplied = (value) => {
        wasApplied = value
      }

      const semanticsr = ask.semanticsr || []
      if (semanticsr.length == 0) {
        semanticsr.push({ match: ask.matchr, apply: ask.applyr })
      }
      for (const semantic of semanticsr) {
        const id_r = stableId('semantic')
        id_rs.push(id_r)
        config.addSemantic({
          uuid,
          id: id_r,
          tied_ids: [id_q],
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
        where: ask.where,
        isQuestion: true,  // do one question at a time
        getWasAsked,
        getWasApplied,
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
            args.verbatim(await applyq({ ...args, wasAsked: getWasAsked() }))
            setWasAsked(true)
            args.context.controlKeepMotivation = true
          }
          args.context.cascade = true
        }
      })
    }
    if (!Array.isArray(asks)) {
      asks = [asks]
    }

    [...asks].reverse().forEach( (a) => ask(a) )
  }
}


const initializer = ({objects, config, isModule}) => {
  config.addArgs(({config, api, isA}) => ({ 
    getUUIDScoped: (uuid) => { 
      const ask = getAsk(config)(uuid)
      return {
        ask,
        askWhich: ({ choices, chosen, question, isChoice, onNevermind }) => {
          let state = {}

          requiredArgument(choices, 'choices')
          requiredArgument(chosen, 'chosen')

          if (!onNevermind) {
            onNevermind = ({objects, context}) => {
              return true
            }
          }

          if (!question) {
            const question = async ({choices, g, gs, wasAsked, state}) => {
              if (wasAsked) {
                return `${await g(state.lastChoice)} is not a choice. The choices are: ${await gs(choices, ' ', ' or ')}`
              } else {
                return `Which value do you want: ${await gs(choices, ' ', ' or ')}`
              }
            }
          }

          if (!isChoice) {
            const isChoice = ({context, choices, state}) => {
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
      objects: ['onNevermindWasCalled', 'nevermindType', 'choice'],
      context: defaultContextCheck,
    },
  },
})
