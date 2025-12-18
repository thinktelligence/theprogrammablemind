const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck, getValue, setValue } = require('./helpers')
const picarx_tests = require('./picarx.test.json')
const picarx_instance = require('./picarx.instance.json')
const hierarchy = require('./hierarchy')
const rates = require('./rates')
const help = require('./help')

/*
todo

  DONE why is 3 meters not marker: length its marker dimension
  DONE how to handle time in the testing
  repeat that/what/say again/say that again
  make it say the howToCalibrate right from the start. maybe have some prime it call?!?!?!
  convert from length to a some kind of standard number
  shut up/dont talk/be quiet -> stop saying responses

  call this point a
  move 5 feet
  call this point b
  moving between a and b is patrol 1
  do patrol 1 every 3 minutes
  what is patrol 1

  calibrate distance
  stop

  go forward slowly
  stop
  that was 2 feet

  do a circle 2 feet in diameter every 2 minutes

  this is jeff
  say hi


  say your names
  car 1 do patrol one
  car 1 and 2 go to point a

  who car 1

  just say the speed


  go forward 2 meters
*/

class API {
  initialize({ objects }) {
    this._objects = objects
    this._objects.reminders = []
    this._objects.id = 0
    this._objects.current = null
    this._objects.defaultTime = { hour: 9, minute: 0, second: 0, millisecond: 0 }
    delete this.testDate
  }

  now() {
    if (this.args.isProcess || this.args.isTest) {
      if (!this.testDate) {
        this.testDate = new Date(2025, 5, 29, 14, 52, 0)
      }
      this.testDate = new Date(this.testDate.getTime() + 1000)
      return this.testDate
    } else {
      return new Date()
    }
  }

}

const howToCalibrate = "When you are ready say calibrate. The car will drive forward at 10 percent power then say stop. Measure the distance and tell me that. Or you can say the speed of the car at percentage of power."

const askForProperty = ({
  objects,
  ask,
  propertyPath,
  query,
}) => {
  ask({
    where: where(),
    oneShot: false, 

    matchq: ({ api, context }) => !getValue(propertyPath, objects) && context.marker == 'controlEnd',
    applyq: async ({ say }) => query,

    matchr: ({context}) => context.marker == 'dimension',
    applyr: async ({objects, context}) => {
      // objects.calibration.distance = context
      setValue(propertyPath, objects, context)
    },
  })
}

const template = {
  fragments: [ 
    // "forward",
  ],
  configs: [
    "car is a concept",
    "picarx is a car",
    //TODO "forward left, right, backward are directions",
    "forward, left, right, and backward are directions",
    "speed is a property",
    ({objects}) => {
      objects.calibration = {
        startTime: undefined,   // start time for calibration
        endTime: undefined,     // end time for calibration
        duration: undefined,    // end time - start time
        distance: undefined,    // distance travelled during calibration in mm
        power: 0.1,
        speed: undefined,       // meters per second
      }
      objects.direction = undefined   // direction to go if going
    },
    (args) => {
      askForProperty({
        ...args,
        propertyPath: ['calibration', 'distance'],
        query: "How far did the car go?",
      })
      askForProperty({
        ...args,
        propertyPath: ['calibration', 'endTime'],
        query: "Say stop when the car has driven enough.",
      })
      askForProperty({
        ...args,
        propertyPath: ['calibration', 'startTime'],
        query: howToCalibrate
      })

      // expectProperty
      args.config.addSemantic({
        match: ({context, isA}) => isA(context.marker, 'direction'),
        apply: ({context}) => {
          objects.direction = context
        }
      })

      // expectProperty
      args.config.addSemantic({
        match: ({context, isA}) => isA(context.marker, 'dimension'),
        apply: ({context, objects}) => {
          objects.calibration.distance = context
        }
      })

      args.config.addSemantic({
        match: ({context, objects, isA}) => objects.direction && objects.dimension && context.marker == 'controlEnd',
        apply: ({context, objects}) => {
          // send a command to the car
        }
      })
    },
    {
      operators: [
        "([calibrate])",
        "([pause] ([number]))",
        "([stop] ([car|])?)",
        "([go])",
      ],
      bridges: [
        { id: "go" },
        {
          id: 'calibrate',
          isA: ['verb'],
          bridge: "{ ...next(operator), interpolate: [{ context: operator }] }",
          semantic: ({context, objects, api}) => {
            objects.calibration.startTime = api.now()
            // send command to car to go forward
          }
        },
        {
          id: 'pause',
          isA: ['verb'],
          bridge: "{ ...operator, time: after[0], interpolate: [{ context: operator }, { property: 'time' }] }",
          semantic: async ({context}) => {
            // why doesn't nodejs add a sleep function. I always have to look up how to do this because its not fucking memorable.
            const sleep = (ms) => new Promise(r => setTimeout(r, ms));
            await sleep(context.time.value*1000) 
          }
        },
        {
          id: 'stop',
          isA: ['verb'],
          optional: {
            1: "{ marker: 'picarx' }",
          },
          bridge: "{ ...next(operator), object: after[0], interpolate: [{ context: operator }, { property: 'object' }] }",
          semantic: ({context, objects, api, say}) => {
            if (!objects.calibration.startTime) {
              // default will say how to calibrate
            } else {
              objects.calibration.endTime = api.now()
              objects.calibration.duration = objects.calibration.endTime - objects.calibration.startTime
            }
          }
        },
      ],
      generators: [
        {
          match: ({context}) => context.marker == 'help' && !context.paraphrase && context.isResponse,
          apply: () => ''
        },
      ],
    },
  ],
}

knowledgeModule( { 
  config: { name: 'picarx' },
  includes: [hierarchy, rates, help],
  api: () => new API(),

  module,
  description: 'controlling a picarx',
  test: {
    name: './picarx.test.json',
    contents: picarx_tests,
    checks: {
      context: [defaultContextCheck()],
      objects: [
        'calibrate',
      ],
    }
  },
  template: {
    template,
    instance: picarx_instance,
  },

})
