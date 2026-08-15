const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck, getValue, setValue, memoizeAsync, words } = require('./helpers')
const tests = require('./askfor.test.json')
const instance = require('./askfor.instance.json')
const length = require('./length')
const dates = require('./dates')
const people = require('./people')

// TODO if you know the name and address of a person do such and such
// TODO stop asking that

function askForProperty({
  ask,
  query,
  getValue,
  setValue,
  matchr,
  oneShot=false,
}) {
  ask({
    where: where(),
    oneShot,

    matchq: async ({ api, context, objects }) => !await getValue() && context.marker == 'controlEnd',
    applyq: async ({ say, objects }) => {
      return await query()
    },

    matchr,
    applyr: setValue,
  })
}

// for greg find out the birthdate and gender

const template = {
  configs: [
    "setidsuffix _askfor",
    { query: 'what is the concept?', isFragment: true },
    ({objects}) => {
      objects.askFor = []
    },
    {
      operators: [
        "([askfor_askfor|] ([for_askfor|] (@<= concept)))",
        "([information])",
      ],
      bridges: [
        {
          id: 'information',
          isA: ['noun'],
          evaluator: async ({context, e, callId, toList, flatten, toEValue, resolveEvaluate, objects}) => {
            const properties = objects.askFor
            const [fproperties, _]  = flatten(properties)
            const values = []
            for (const property of fproperties) {
              const value = await e(property[0])
              values.push({ marker: 'labelledValue', label:property[0], value })
            }
            debugger
            resolveEvaluate(context, toList(values))
          },
        },
        {
          id: 'for_askfor',
          isA: ['preposition'],
          words: ['for'],
          bridge: `{
            ...operator,
            interpolate: [ { self: true }, { property: 'argument' } ],
            argument: after[0]
          }`,
        },
        {
          id: 'askfor_askfor',
          isA: ['verb'],
          words: ['ask'],
          bridge: `{
            ...next(operator),
            properties: after[0],
            interpolate: [{ self: true }, { property: 'properties' }]
          }`,
          semantic: async ({e, s, gp, objects, context, ask, fragments, toEValue}) => {
            const query = memoizeAsync(async () => await(gp(await fragments("what is the concept?", { concept: context.properties.argument }))))
            const compatible_types = context.properties.argument.compatible_types || [context.properties.argument.marker]
            const matchr = ({context, isA}) => !context.same && !context.evaluate && isA(context, compatible_types)
            const property = context.properties.argument
            const getValue = async () => {
              const value = toEValue(await e(property))
              if (value.marker == 'answerNotKnown') {
                return
              }
              return value
            }
            objects.askFor.push(property)
            const setValue = async ({ context, namespaced }) => {
              debugger
              const is = { marker: 'is', one: property, two: context, greg101: true }
              namespaced.set('dialogs', is, 'allowHierarchy', false)
              await s(is)
            }
            askForProperty({
              ask,
              getValue,
              setValue,
              query,
              matchr,
            })
          }
        }
      ],
    },
    "resetIdSuffix",
  ],
}

knowledgeModule( { 
  config: { name: 'askfor' },
  includes: [length, dates, people],

  module,
  description: 'asking the system to interact with a user and find out information',
  test: {
    name: './askfor.test.json',
    contents: tests,
    checks: {
      context: [defaultContextCheck()],
      objects: ['askFor'],
    }
  },
  instance,
  template,
})
