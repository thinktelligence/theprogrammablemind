const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const picarx_tests = require('./picarx.test.json')
const picarx_instance = require('./picarx.instance.json')
const hierarchy = require('./hierarchy')
const length = require('./length')

/*
todo

  why is 3 meters not marker: length its marker dimension
  repeat that/what/say again/say that again
  how to handle time in the testing
  make it say the howToCalibrate right from the start. maybe have some prime it call?!?!?!

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
*/

const howToCalibrate = "When you are ready say calibrate. The car will drive forward at 10 percent power then say stop. Measure the distance and tell me that. Or you can say the speed of the car at percentage of power."

const askForProperty = ({
  objects,
  ask,
  property,
  query,
}) => {
  ask({
    where: where(),
    oneShot: false, 

    matchq: ({ api, context }) => !objects[property] && context.marker == 'controlEnd',
    applyq: async ({ say }) => query,

    matchr: ({context}) => context.marker == 'dimension',
    applyr: async ({objects, context}) => {
      objects.distance = context
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
      objects.startTime = undefined   // start time for calibration
      objects.endTime = undefined     // end time for calibration
      objects.duration = undefined    // end time - start time
      objects.distance = undefined    // distance travelled during calibration in mm
      objects.speed = undefined       // distance / duration
      objects.direction = undefined   // direction to go if going
    },
    (args) => {
      askForProperty({
        ...args,
        property: 'distance',
        query: "How far did the car go?",
      })
      askForProperty({
        ...args,
        property: 'endTime',
        query: "Say stop when the car has driven enough.",
      })
      askForProperty({
        ...args,
        property: 'startTime',
        query: howToCalibrate
      })
    },
    {
      operators: [
        "([calibrate] ([distance]))",
        "([pause] ([number]))",
        "([stop] ([car|])?)",
      ],
      bridges: [
        {
          id: "go",
          level: 0,
          words: ['go'],
          bridge: "{ ...next(operator), distance: distance?, direction: direction?, interpolate: [{ property: 'operator' }, { property: 'direction' }, { property: 'distance' }] }",
          selector: {
            arguments: {
              direction: "isA(context.marker, 'direction')",
              distance: "isA(context.marker, 'dimension')",
            },
          },
        },

        {
          id: 'calibrate',
          isA: ['verb'],
          bridge: "{ ...operator, dimension: after[0], interpolate: [{ context: operator }, { property: 'dimension' }] }",
          semantic: ({context, objects}) => {
            objects.startTime = Date.now()
            // send command to car to go forward
          }
        },
        {
          id: 'distance',
          isA: ['theAble'],
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
          semantic: ({context, objects, say}) => {
            if (!objects.startTime) {
              say(howToCalibrate)
            } else {
              objects.endTime = Date.now()
              objects.duration = objects.endTime - objects.startTime
            }
          }
        },
      ],
    },
  ],
}

knowledgeModule( { 
  config: { name: 'picarx' },
  includes: [hierarchy, length],

  module,
  description: 'controlling a picarx',
  test: {
    name: './picarx.test.json',
    contents: picarx_tests,
    checks: {
      context: [defaultContextCheck()],
      objects: [
        'startTime',
        'endTime',
        'duration',
        'distance',
        'speed',
      ],
    }
  },
  template: {
    template,
    instance: picarx_instance,
  },

})
