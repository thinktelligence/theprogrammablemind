const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const tell = require('./tell')
const dimension = require('./dimension')
const helpers = require('./helpers')
const time_tests = require('./time.test.json')
const instance = require('./time.instance.json')

function pad(v, l) {
  const s = String(v)
  const n = l - s.length
  return "0".repeat(n) + s
}

//"what is the time in 24 hour format"
//"what time is it in Paris"
//"what time is it in GMT"
// what is the time
// how many hours are in a day

class API {
  // gets the contexts for doing the happening
  semantics({context, args, kms}) {
    const api = kms.time.api
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

  now() {
    if (this.args.isProcess || this.args.isTest) {
      return new Date(2025, 5, 29, 14, 52, 0)
    } else {
      return new Date()
    }
  }

  newDate() {
    return new Date()
  }

  initialize() {
  }
}


const template = {
  configs: [
    "years hours minutes and seconds are units of time",
    "hours = minutes / 60",
    "minutes = hours * 60",
    "seconds = minutes * 60",
    "hours = seconds / 3600",
    "seconds = hours * 3600",
    "minutes = seconds / 60",
    "day = hours / 24",
    "hours = days * 24",
    {
      operators: [
        "(([timePoint]) [ampm|])",
        "([atTime|at] (timePoint))",
        "([use] (([timeUnit]) [timeFormat|format]))",
        "([hourMinutes|] (integer) (colon) (integer))",
      ],
      bridges: [
        {
          id: 'hourMinutes',
          isA: ['timePoint'],
          convolution: true,
          bridge: "{ ...next(operator), hour: after[0], colon: after[1], minute: after[2], interpolate: '${hour}${colon}${minute}' }",
        },
        { 
          id: "timePoint",
          words: ['time'],
          isA: ['noun'],
        },
        { 
          id: "atTime", 
          words: ['@'],
          isA: ['preposition'],
          bridge: "{ ...next(operator), time: after[0], operator: operator,  interpolate: '${operator} ${time}' }" 
        },
        { 
          id: "ampm", 
          isA: ['adjective'],
          localHierarchy: [
            ['integer', 'timePoint'],
          ],
          bridge: "{ ...next(before[0]), marker: if(isA(before[0].marker, 'integer'), operator('timePoint'), before[0].marker), ampm: operator, time: before[0], interpolate: concat(default(before[0].interpolate, '${time}'), ' ${ampm}') }",
        },
        { 
          id: "timeFormat", 
          bridge: "{ ...before[0], ...next(operator) }" 
        },
        { 
          id: "timeUnit", 
          isA: ['countable'],
          words: [ 
            ...helpers.words('hour', { initial: "{ units: 'hour' }" }),
            ...helpers.words('minute', { initial: "{ units: 'minute' }" }),
            ...helpers.words('second', { initial: "{ units: 'second' }" }),
          ],
          bridge: "{ ...next(operator) }" 
        },
        { 
          id: "use",
          bridge: "{ ...next(operator), format: after[0] }",
          generatorp: ({g, context}) => `use ${context.format.quantity.value} hour time` 
        },
      ],
      hierarchy: [
    /*
        ['ampm', 'queryable'],
        ['timeUnit', 'countable'],
    */
      ],
      "words": {
        "literals": {
          "am": [{id: "ampm", "initial": "{ ampm: 'am', determined: true }" }],
          "pm": [{id: "ampm", "initial": "{ ampm: 'pm', determined: true }" }],
        }
      },

      generators: [
        { 
          where: where(),
          match: ({context}) => context.marker == 'timePoint' && context.evalue && context.format == 12, 
          apply: ({context}) => {
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
          match: ({context}) => context.marker == 'timePoint' && context.evalue && context.format == 24, 
          apply: ({g, context}) => {
            function pad(num, size) {
              num = num.toString();
              while (num.length < size) num = "0" + num;
              return num;
            }

              return `${context.evalue.getHours()}:${pad(context.evalue.getMinutes(), 2)}` 
          }
        },
        { 
          where: where(),
          match: ({context}) => context.marker == 'response', 
          apply: ({g, context}) => context.text 
        },
      ],

      semantics: [
        {
          notes: 'evaluate time',
          where: where(),
          match: ({objects, context, api}) => context.marker == 'timePoint' && context.evaluate, 
          apply: ({objects, context, api}) => {
            context.evalue = api.newDate()
            context.format = objects.format
          }
        },
        {
          notes: 'use time format working case',
          where: where(),
          match: ({objects, context}) => context.marker == 'use' && context.format && (context.format.quantity.value == 12 || context.format.quantity.value == 24), 
          apply: ({objects, context}) => {
            objects.format = context.format.quantity.value
          }
        },
        {
          notes: 'use time format error case',
          where: where(),
          match: ({objects, context}) => context.marker == 'use' && context.format && (context.format.quantity.value != 12 && context.format.quantity.value != 24), 
          apply: ({objects, context}) => {
            context.marker = 'response'
            context.text = 'The hour format is 12 hour or 24 hour'
          }
        },
      ],
    }
  ],
}

function initializer({api, config, objects, kms, isModule}) {
  if (!isModule) {
    kms.time.api.newDate = () => new Date("December 25, 1995 1:59:58 pm" )
  }
  Object.assign(objects, {
    format: 12  // or 24
  });
  config.addSemantic({
      match: ({context, hierarchy, args}) => context.happening && context.marker == 'is' && args({ types: ['ampm', 'time'], properties: ['one', 'two'] }),
      apply: api.semantics
  })
}

knowledgeModule({
  config: { name: 'time' },
  includes: [tell, dimension],
  api: () => new API(),
  initializer,

  module,
  description: 'Time related concepts',
  test: {
    name: './time.test.json',
    contents: time_tests,
    checks: {
      context: [defaultContextCheck({ extra: ['one', 'two', 'events', 'time', 'timePoint', 'ampm'] })],
    }
  },
  template: { template, instance },
})
