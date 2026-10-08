const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck, getValue, setValue, memoizeAsync, words } = require('./helpers')
const { flattenInPlace } = require('./helpers/flatten_in_place')
const tests = require('./askfor.test.json')
const instance = require('./askfor.instance.json')
const length = require('./length')
const time = require('./time')
const dates = require('./dates')
const people = require('./people')

const DEBUGG = false

// TODO if you know the name and address of a person do such and such
// TODO stop asking that

function askForProperty({
  ask,
  query,
  getValue,
  setValue,
  matchr,
  tag,
  oneShot=true,
}) {
  ask({
    where: where(),
    oneShot,
    tag,

    matchq: async (args) => !await getValue(args) && args.context.marker == 'controlEnd',
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
        "(([known]) [knownAbout|about] (*))",
      ],
      generators: [
        {
          match: ({context}) => context.marker == 'is' && context.one.marker == 'known',
          apply: async ({context, g}) => {
            return await g(context.two)
          }
        },
      ],
      bridges: [
        {
          id: 'knownAbout',
          isA: ['preposition'],
          bridge: `{
            ...before[0],
            subjects: append(after[0].subjects, after),
            known: before[0],
            about: operator,
            interpolate: '\${known} \${about} \${subjects}'
          }`,
        },
        {
          id: 'known',
          isA: ['queryable'],
          evaluator: async ({kms, context, e, callId, toList, flatten, toEValue, resolveEvaluate, objects}) => {
            const known = await kms.properties.api.getProperty(context.subjects[0], 'property')
            resolveEvaluate(context, known)
          },
        },
        {
          id: 'information',
          isA: ['noun'],
          evaluator: async ({context, e, callId, toList, flatten, toEValue, resolveEvaluate, objects}) => {
            const properties = objects.askFor
            const values = []
            for (const property of properties) {
              // const value = toEValue(await e(property))
              const value = (await e(property)).evalue
              values.push({ marker: 'labelledValue', label: property, value })
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
            const getValue = (property) => async (args) => {
              const value = toEValue(await e(property))
              if (value.marker === 'undefined') {
                return
              }
              return value
            }

            const setValue = (property) => async ({ context, namespaced, tag }) => {
              const is = { marker: 'is', one: property, two: context }
              namespaced.set('dialogs', is, 'allowHierarchy', false)
              await s(is)
            }

            const properties = flattenInPlace(argument)
            counter = 0
            for (const property of properties.reverse()) {
              counter += 1
              const query = memoizeAsync(async () => await(gp(await fragments("what is the concept?", { concept: property }))))
              const compatible_types = property.compatible_types || [property.marker]
              const matchr = ({context, isA}) => {
                return !context.same && isA(context, compatible_types)
              }
              objects.askFor.push(property);
              askForProperty({
                ask,
                tag: `ask#${counter}`,
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
  includes: [time, length, dates, people],

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
