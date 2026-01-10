const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck, getValue, setValue } = require('./helpers')
const tank_tests = require('./tank.test.json')
const tank_instance = require('./tank.instance.json')
const hierarchy = require('./hierarchy')
const rates = require('./rates')
const help = require('./help')

/*
todo

  VOSK

    https://alphacephei.com/vosk/

  FreeNode Tank

  https://docs.freenove.com/projects/fnk0077/en/latest/fnk0077/codes/tutorial/3_Module_test_%28necessary%29.html
https://www.amazon.ca/Freenove-Raspberry-Tracking-Avoidance-Ultrasonic/dp/B0BNDQFRP1/ref=sr_1_1_sspa?crid=1JT788RT84O8C&dib=eyJ2IjoiMSJ9.1W6XTWnHwPcqZTD8iRfmF7hHwiVycHjB02NHKEcqGfQSUKyJfN0OLyaaoCcypQug_C9CGah-7wLgfAtJRs_JKiwDsqYXqFfvvoU5ETBk_Le-S9Qt4kwh92r0w19bzA5my7aQpT52ssw8-f8Xpzjbqm1uFsLh82jF4V7P8xMKobjVHHILXalReEPuJz2OlF6y_ihwtUuVLDjMkuvNPoK-M7YLntLqKQy229XKjtDSUV4J0YT1L8uLVWHZ-ySs_MmG_w-oyZ9QFIe0a9hJEMuiu_BcaDmxFkwMeGBro2uczAU.NlqF_FH_6PvflZKozPylFlIyKuwx7mAB-jAggC1aPFk&dib_tag=se&keywords=Freenove+Tank+Robot+Kit&qid=1766258114&sprefix=freenove+tank+robot+kit%2Caps%2C130&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1


  send commands to arduino from another computer:

    https://www.npmjs.com/package/johnny-five

  KEYESTUDIO Mini Tank Robot V2 Smart Car Kit for Arduino

    https://www.amazon.ca/KEYESTUDIO-Infrared-Ultrasonic-Obstacle-Avoidance/dp/B07X4W7SZ5/ref=sr_1_10?crid=2A71NHZNTAION&dib=eyJ2IjoiMSJ9.W-I4I_tfyGdGt2UrNlNrlFeKnfIwppniNSX5FJndx77Ht944f9RylJD9me0PiqV5V_b185b17BsrPdKxmYYHnJ-Odb7hbdVzKs019mag1nCL-Wqe4aR0IYrEOzJkKTnR4YbXGYwriLd26OBYjhNvgaCFyE5uwsYkAK-qJXI2Xiui19oLiLYrmJvBz0bCHe4s7U6OdmaumYhhfxpVErk1E1zAwxE8kdq_YD7ZCMRjKS9Tr6cbayIh9GKDwMLuW-LCdzOW2eQx-dTB7yXV53rpV34IBAcCE1IgmwwNIIW7E6Y.fdaAuj4qvXq-67f5ktOq7Coo8lggrMiB_TFFtluqDtI&dib_tag=se&keywords=Adafruit+Mini+Round+Robot+Chassis+Kit&qid=1766256581&sprefix=adafruit+mini+round+robot+chassis+kit+%2Caps%2C123&sr=8-10
    https://github.com/ericmend/mini-tank/blob/master/README.md




  vosk

  https://github.com/sunfounder/picar-x/tree/v2.0/gpt_examples
  https://github.com/sunfounder/picar-x/tree/v2.0/example
  VOSK: https://docs.sunfounder.com/projects/picar-x-v20/en/latest/ai_interaction/python_voice_control.html

  DONE why is 3 meters not marker: length its marker dimension
  DONE how to handle time in the testing
  repeat that/what/say again/say that again
  make it say the howToCalibrate right from the start. maybe have some prime it call?!?!?!
  convert from length to a some kind of standard number
  shut up/dont talk/be quiet -> stop saying responses

  use it to measure distances -> go forward. stop. how far was that

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

  pan camera left slowly
  do the cylon every 30 seconds
*/

class API {
  initialize({ objects }) {
    this._objects = objects
    this._objects.defaultTime = { hour: 9, minute: 0, second: 0, millisecond: 0 }
    delete this.testDate

    objects.calibration = {
      startTime: undefined,   // start time for calibration
      endTime: undefined,     // end time for calibration
      duration: undefined,    // end time - start time
      distance: undefined,    // distance travelled during calibration in mm
      power: 0.1,
      speed: undefined,       // meters per second
    }
    objects.current = {
      // direction: undefined,   // direction to go if going
      // power: undefined,       // power
    }
    objects.history = []
    objects.isCalibrated = false
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

  sendCommand() {
    const command = { power: this._objects.calibration.power, ...this._objects.current }
    switch (command.direction) {
      case 'forward':
        this.forward(command.power)
        break
      case 'backward':
        this.backward(command.power)
        break
      case 'around':
        this.rotate(180)
        break
    }

    if (command.distance) {
      const distance_meters = command.distance
      const speed_meters_per_second = this._objects.calibration.speed
      const duration_seconds = distance_meters / speed_meters_per_second
      this.pause(duration_seconds)
      this.stop()
    }
  }

  pause(duration_seconds) {
    this._objects.history.push({ pause: duration_seconds })
  }

  // subclass and override the remaining to call the car

  forward(power) {
    this._objects.history.push({ direction: 'forward', power })
  }

  backward(power) {
    this._objects.history.push({ direction: 'backward', power })
  }

  // -angle is counterclockwise
  // +angle is clockwise

  rotate(angle) {
    this._objects.history.push({ turn: angle })
  }

  turn(angle) {
  }

  tilt_angle(angle) {
  }

  pan_angle(angle) {
  }

  stop() {
    this._objects.history.push({ power: 0 })
  }
}

const howToCalibrate = "When you are ready say calibrate. The tank will drive forward at 10 percent power then say stop. Measure the distance and tell me that. Or you can say the speed of the tank at percentage of power."

function askForProperty({
  ask,
  propertyPath,
  contextPath=[],
  query,
  matchr,
  oneShot=false, 
}) {
  ask({
    where: where(),
    oneShot,

    matchq: ({ api, context, objects }) => !getValue(propertyPath, objects) && context.marker == 'controlEnd',
    applyq: async ({ say, objects }) => {
      return query
    },

    matchr,
    applyr: async ({objects, context}) => {
      setValue(propertyPath, objects, getValue(contextPath, context))
    },
  })
}

function askForCalibrationDistance(args) {
  askForProperty({
    ...args,
    propertyPath: ['calibration', 'distance'],
    query: "How far did the tank go?",
    matchr: ({context, objects}) => objects.calibration.endTime && context.marker == 'quantity' && context.unit.dimension == 'length',
  })
}

function askForEndTime(args) {
  askForProperty({
    ...args,
    propertyPath: ['calibration', 'endTime'],
    query: "Say stop when the tank has driven enough.",
    matchr: () => false,
  })
}

function askForStartTime(args) {
  askForProperty({
    ...args,
    propertyPath: ['calibration', 'startTime'],
    query: howToCalibrate,
    matchr: () => false,
  })
}

// expectProperty
function expectDirection(args) {
  args.config.addSemantic({
    match: ({context, isA}) => isA(context.marker, 'direction'),
    apply: ({objects, context}) => {
      objects.current.direction = context.marker
    }
  })
}

// expectProperty
function expectDistanceForCalibration(args) {
  args.config.addSemantic({
    oneShot: true,
    match: ({context, isA, objects}) => isA(context.marker, 'quantity') && !isA(context.unit.marker, 'unitPerUnit') && objects.calibration.startTime,
    apply: async ({context, objects, fragments, e}) => {
      const instantiation = await fragments("quantity in meters", { quantity: context })
      const result = await e(instantiation)
      objects.calibration.distance = result.evalue.amount.evalue.evalue
    }
  })
}

function expectDistanceForMove(args) {
  // TODO save id for recalibration
  args.config.addSemantic({
    match: ({context, isA}) => isA(context.marker, 'quantity') && !isA(context.unit.marker, 'unitPerUnit'),
    apply: async ({context, objects, fragments, e}) => {
      const instantiation = await fragments("quantity in meters", { quantity: context })
      const result = await e(instantiation)
      objects.current.distance = result.evalue.amount.evalue.evalue
    }
  })
}

function expectCalibrationCompletion(args) {
  args.config.addSemantic({
    oneShot: true,
    match: ({context, objects, isA}) => context.marker == 'controlEnd' && objects.calibration.distance && objects.calibration.duration && !objects.calibration.speed,
    apply: ({context, objects, _continue, say}) => {
      objects.calibration.speed = objects.calibration.distance / objects.calibration.duration
      objects.isCalibrated = true
      say(`The tank is calibrated. The speed is ${objects.calibration.speed.toFixed(4)} meters per second at 10 percent power`)
      _continue()
      expectDistanceForMove(args)
    }
  })
}

const template = {
  fragments: [ 
    "quantity in meters",
    "quantity in meters per second",
  ],
  configs: [
    "tank is a concept",
    //TODO "forward left, right, backward are directions",
    "around, forward, left, right, and backward are directions",
    "speed and power are properties",
    (args) => {
      askForCalibrationDistance(args)
      askForEndTime(args)
      askForStartTime(args)

      expectDirection(args)
      expectDistanceForCalibration(args)
      expectCalibrationCompletion(args)

      args.config.addSemantic({
        match: ({context, isA}) => isA(context.marker, 'quantity') && isA(context.unit.marker, 'unitPerUnit'),
        apply: async ({context, objects, api, fragments, e}) => {
          // send a command to the tank
          const instantiation = await fragments("quantity in meters per second", { quantity: context })
          const result = await e(instantiation)
          const desired_speed = result.evalue.amount.evalue.evalue
          const desired_power = objects.calibration.power * (desired_speed / objects.calibration.speed)
          objects.current.power = desired_power 
        }
      })

      args.config.addSemantic({
        match: ({context, objects, isA}) => objects.current.direction && objects.isCalibrated && context.marker == 'controlEnd',
        apply: ({context, objects, api}) => {
          // send a command to the tank
          api.sendCommand()
        }
      })
    },
    {
      operators: [
        "([calibrate])",
        "([turn] (direction))",
        "([pause] ([number]))",
        "([stop] ([tank|])?)",
        "([go])",
      ],
      bridges: [
        { id: "go" },
        {
          id: 'turn',
          isA: ['verb'],
          bridge: "{ ...next(operator), direction: after[0], interpolate: [{ context: operator }, { property: 'direction' }] }",
          semantic: ({context, objects, api}) => {
            objects.current.direction = context.direction.marker
          },
          // check: { marker: 'turn', exported: true, extra: ['direction'] }
        },
        {
          id: 'calibrate',
          isA: ['verb'],
          bridge: "{ ...next(operator), interpolate: [{ context: operator }] }",
          semantic: ({context, objects, api}) => {
            objects.calibration.startTime = api.now()
            // send command to tank to go forward
          }
        },
        {
          id: 'pause',
          isA: ['verb'],
          bridge: "{ ...operator, time: after[0], interpolate: [{ context: operator }, { property: 'time' }] }",
          semantic: async ({context}) => {
            // why doesn't nodejs add a sleep function. I always have to look up how to do this because its not fucking memorable.
            // function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
            // await sleep(context.time.value*1000) 
          }
        },
        {
          id: 'stop',
          isA: ['verb'],
          optional: {
            1: "{ marker: 'tank' }",
          },
          bridge: "{ ...next(operator), object: after[0], interpolate: [{ context: operator }, { property: 'object' }] }",
          semantic: ({context, objects, api, say}) => {
            if (!objects.calibration.startTime) {
              // default will say how to calibrate
            } else {
              objects.calibration.endTime = api.now()
              objects.calibration.duration = (objects.calibration.endTime - objects.calibration.startTime)/1000
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
  config: { name: 'tank' },
  includes: [hierarchy, rates, help],
  api: () => new API(),

  module,
  description: 'controlling a tank',
  test: {
    name: './tank.test.json',
    contents: tank_tests,
    checks: {
      context: [
        defaultContextCheck({ marker: 'turn', exported: true, extra: ['direction'] }),
        defaultContextCheck(),
      ],
      objects: [
        'calibration',
        'history',
        'current',
      ],
    }
  },
  template: {
    template,
    instance: tank_instance,
  },

})
