const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck, getValue, setValue, memoizeAsync, words } = require('./helpers')
const { flattenInPlace } = require('./helpers/flatten_in_place')
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
            const values = []
            debugger
            for (const property of properties) {
              // const value = toEValue(await e(property))
              const value = (await e(property)).evalue
              debugger
              values.push({ marker: 'labelledValue', label:property, value })
            }
            resolveEvaluate(context, toList(values))
          },
        },
        {
          id: 'for_askfor',
          // isA: ['preposition'],
          words: ['for'],
          after: [['propertyOf', 1]],
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
          semantic: async ({e, s, gp, objects, flatten, context, ask, fragments, toEValue}) => {
            const argument = context.properties.argument

            const getValue = (property) => async () => {
              const value = toEValue(await e(property))
              if (value.marker == 'answerNotKnown') {
                return
              }
              return value
            }

            const setValue = (property) => async ({ context, namespaced }) => {
              const is = { marker: 'is', one: property, two: context }
              namespaced.set('dialogs', is, 'allowHierarchy', false)
              await s(is)
            }

            const properties = flattenInPlace(argument)
            for (const property of properties.reverse()) {
              const query = memoizeAsync(async () => await(gp(await fragments("what is the concept?", { concept: property }))))
              const compatible_types = property.compatible_types || [property.marker]
              const matchr = ({context, isA}) => !context.same && !context.evaluate && isA(context, compatible_types)
              objects.askFor.push(property);
              debugger
              askForProperty({
                ask,
                getValue: getValue(property),
                setValue: setValue(property),
                query,
                matchr,
              })
            }
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
