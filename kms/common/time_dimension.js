const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
>const { defaultContextCheck } = require('./helpers')
const dimension = require('./dimension.js')
const time_tests = require('./time_dimension.test.json')
const time_instance = require('./time_dimension.instance.json')

const pad = (v, l) => {
  const s = String(v)
  const n = l - s.length
  return "0".repeat(n) + s
}

/*
    "2 pm",
    "tell me when the time is 2 pm",
    "use 12 hour format what is the time",
    "use 24 hour format what is the time",
    "use 36 hour format",
    "what is the time"
    what is the date
    what day is today
*/
const template = {
  configs: [
    "years hours minutes and seconds are units of time",
    "hours = minutes / 60",
    "minutes = hours * 60",
    "seconds = minutes * 60",
    "minutes = seconds / 60",
    "day = hours / 24",
    "hours = days * 24",
  ],
}

class API {
  // gets the contexts for doing the happening
  semantics({context, isModule, args, api}) {
        const values = args({ types: ['ampm', 'time'], properties: ['one', 'two']  })
        const ampm = context[values[0]]
        let hour = ampm.hour.hour
        if (ampm.ampm == 'pm') {
          hour += 12;
        }
        const ms = helpers.millisecondsUntilHourOfDay(api.newDate, hour)
        const promise =  new Promise((resolve) => {
          setTimeout( () => resolve(context), ms);
        }).then( () => context )
        context.event = promise
      }

  newDate() {
    return new Date()
  }

  initialize() {
  }
}
const api = new API()

const createConfig = async () => {
  const config = new Config({ 
    name: 'time_dimension',
    operators: [
      "([time])",
      "((number/1) [ampm:hourBridge|])",
      "((number/1) (colon/1) (number/1) [ampm:hourMinuteBridge|])",
    ],
    generators: [
      {
        where: where(),
        match: ({context}) => context.marker == 'time' && context.evalue && (context.format == 12 || !context.format),
        apply: ({g, context}) => {
          let hh = context.evalue.getHours();
          let ampm = 'am'
          if (hh > 12) {
            hh -= 12;
            ampm = 'pm'
          }
          let ss = context.evalue.getMinutes()
          ss = pad(ss, 2)
          return `${hh}:${ss} ${ampm}`
        }
      },
      {
        where: where(),
        match: ({context}) => context.marker == 'time' && context.evalue && context.format == 24,
        apply: ({g, context}) => {
          const pad = (num, size) => {
            num = num.toString();
            while (num.length < size) num = "0" + num;
            return num;
          }

            return `${context.evalue.getHours()}:${pad(context.evalue.getMinutes(), 2)}`
        }
      },
    ],
    bridges: [
      { 
        id: 'time',
        isA: ['queryable', 'theAble'],
        evaluator: ({context, api}) => {
          context.evalue = api.newDate()
        }
      },
      { 
        id: 'ampm', 
        words: ['am', 'pm'],
        generatorp: ({context, g}) => {
          if (context.minute) {
            return `${g(context.hour)}:${g({ ...context.minute, leadingZeros: true, length: 2 })} ${context.word}`
          } else {
            return `${g(context.hour)} ${context.word}`
          }
        },
        bridge: '{ ...next(operator), hour: before[0] }',
        hourBridge: '{ ...next(operator), hour: before[0] }',
        hourMinuteBridge: '{ ...next(operator), hour: before[2], minute: before[0] }',
      },
    ],
  }, module)
  config.stop_auto_rebuild()
  await config.add(dimension)
  config.api = api

  config.initializer( ({api, config, objects, isModule}) => {
    if (!isModule) {
      api.newDate = () => new Date("December 25, 1995 1:59:58 pm" )
    }
    Object.assign(objects, {
      format: 12  // or 24
    });
  })
  await config.restart_auto_rebuild()

  return config
}

knowledgeModule({ 
  module,
  description: 'Time dimension',
  createConfig,
  test: {
    name: './time_dimension.test.json',
    contents: time_tests
  },
  template: {
    template,
    instance: time_instance
  }
})
