const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck, getValue, setValue, memoizeAsync } = require('./helpers')
const tests = require('./askfor.test.json')
const instance = require('./askfor.instance.json')
const length = require('./length')
const dates = require('./dates')

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

const template = {
  configs: [
    "setidsuffix _askfor",
    { query: 'what is the concept?', isFragment: true },
    {
      operators: [
        "([askfor_askfor|] ([for_askfor|] (@<= concept)))",
      ],
      bridges: [
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
          semantic: async ({e, s, gp, context, ask, fragments, toEValue}) => {
            const query = memoizeAsync(async () => await(gp(await fragments("what is the concept?", { concept: context.properties.argument }))))
            const matchr = ({context, isA}) => !context.same && !context.evaluate && isA(context, 'date_dates')
            const property = context.properties.argument
            const getValue = async () => {
              const value = toEValue(await e(property))
              if (value.marker == 'answerNotKnown') {
                return
              }
              return value
            }
            const setValue = async ({ context }) => {
              debugger
              const is = { marker: 'is', one: property, two: context, greg101: true }
              await s(is)
              debugger
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
  includes: [length, dates],

  module,
  description: 'asking the system to interact with a user and find out information',
  test: {
    name: './askfor.test.json',
    contents: tests,
    checks: {
      context: [defaultContextCheck()],
    }
  },
  instance,
  template,
})
