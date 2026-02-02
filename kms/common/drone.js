const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck, getValue, setValue } = require('./helpers')
const drone_tests = require('./drone.test.json')
const instance = require('./drone.instance.json')
const hierarchy = require('./hierarchy')
const ordinals = require('./ordinals')
const nameable = require('./nameable')
const rates = require('./rates')
const help = require('./help')
const { degreesToRadians, radiansToDegrees, cartesianToPolar } = require('./helpers/drone')

/*
todo

  VOSK

    https://alphacephei.com/vosk/

  FreeNode Tank

  https://docs.freenove.com/projects/fnk0077/en/latest/fnk0077/codes/tutorial/3_Module_test_%28necessary%29.html
https://www.amazon.ca/Freenove-Raspberry-Tracking-Avoidance-Ultrasonic/dp/B0BNDQFRP1/ref=sr_1_1_sspa?crid=1JT788RT84O8C&dib=eyJ2IjoiMSJ9.1W6XTWnHwPcqZTD8iRfmF7hHwiVycHjB02NHKEcqGfQSUKyJfN0OLyaaoCcypQug_C9CGah-7wLgfAtJRs_JKiwDsqYXqFfvvoU5ETBk_Le-S9Qt4kwh92r0w19bzA5my7aQpT52ssw8-f8Xpzjbqm1uFsLh82jF4V7P8xMKobjVHHILXalReEPuJz2OlF6y_ihwtUuVLDjMkuvNPoK-M7YLntLqKQy229XKjtDSUV4J0YT1L8uLVWHZ-ySs_MmG_w-oyZ9QFIe0a9hJEMuiu_BcaDmxFkwMeGBro2uczAU.NlqF_FH_6PvflZKozPylFlIyKuwx7mAB-jAggC1aPFk&dib_tag=se&keywords=Freenove+Tank+Robot+Kit&qid=1766258114&sprefix=freenove+drone+robot+kit%2Caps%2C130&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1


  send commands to arduino from another computer:

    https://www.npmjs.com/package/johnny-five

  KEYESTUDIO Mini Tank Robot V2 Smart Car Kit for Arduino

    https://www.amazon.ca/KEYESTUDIO-Infrared-Ultrasonic-Obstacle-Avoidance/dp/B07X4W7SZ5/ref=sr_1_10?crid=2A71NHZNTAION&dib=eyJ2IjoiMSJ9.W-I4I_tfyGdGt2UrNlNrlFeKnfIwppniNSX5FJndx77Ht944f9RylJD9me0PiqV5V_b185b17BsrPdKxmYYHnJ-Odb7hbdVzKs019mag1nCL-Wqe4aR0IYrEOzJkKTnR4YbXGYwriLd26OBYjhNvgaCFyE5uwsYkAK-qJXI2Xiui19oLiLYrmJvBz0bCHe4s7U6OdmaumYhhfxpVErk1E1zAwxE8kdq_YD7ZCMRjKS9Tr6cbayIh9GKDwMLuW-LCdzOW2eQx-dTB7yXV53rpV34IBAcCE1IgmwwNIIW7E6Y.fdaAuj4qvXq-67f5ktOq7Coo8lggrMiB_TFFtluqDtI&dib_tag=se&keywords=Adafruit+Mini+Round+Robot+Chassis+Kit&qid=1766256581&sprefix=adafruit+mini+round+robot+chassis+kit+%2Caps%2C123&sr=8-10
    https://github.com/ericmend/mini-drone/blob/master/README.md




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
  moving between a and b is called patrol 1
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

  patrol one is forward 10 feet left 2 feet right 3 feet and back to the start
  go forward 10 feet then go back to the start

  go to the last point
  go back 2 positions

  call the first point start
  call the second point fred
  call the last point june
  call the next point albert

  pause for 4 seconds

  this way is north
  turn west 
  go three meters 
  turn south 
  go 1 foot

  forward for 4 seconds
*/

function expectDirection(args) {
  args.config.addSemantic({
    match: ({context, isA}) => isA(context.marker, 'direction'),
    apply: ({objects, context}) => {
      objects.runCommand = true
      objects.current.direction = context.marker
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
      objects.runCommand = true
      objects.current.distance = result.evalue.amount.evalue.evalue
    }
  })
}

/*
                   ^
                   y
                   |
                  90
                   |
       -180/180 <--^--> 0 -- x ->
                   |
                  -90
*/

class OverrideCheck {
  constructor(base, checks) {
    this.base = base
    this.checks = checks
  }

  check(obj) {
    for (const check of this.checks) {
      if (obj[check] == this.base.prototype[check]) {
        throw new Error(`For ${obj.constructor.name} you need to override ${check}`)
      }
    }
  }
}

/*
L = track separation width (distance between the centers of the two tracks, measured side-to-side, in meters or whatever unit you like)

v = ground speed of each track (in m/s) — assume same magnitude but opposite directionsleft track forward at +v
right track backward at -v (or vice versa for the other direction)

θ = desired turn angle in radians (convert degrees to radians with θ_rad = θ_deg × π / 180)

The angular velocity ω (how fast the tank rotates, in rad/s) is:

  ω = 2v / L

The time t needed to turn by angle θ is:

  t = θ / ω = (θ × L) / (2v)
*/
class API {
  constructor() {
    this.overrideCheck = new OverrideCheck(API, ['forwardDrone', 'backwardDrone', 'rotateDrone', 'sonicDrone', 'tiltAngleDrone', 'panAngleDrone', 'stopDrone', 'saveCalibration'])
    this.overriden = this.constructor !== API
  }

  initialize({ objects }) {
    if (this.overriden) {
      this.overrideCheck.check(this)
    }
    this._objects = objects
    this._objects.defaultTime = { hour: 9, minute: 0, second: 0, millisecond: 0 }
    this._objects.ordinal = 0
    delete this.testDate

    objects.calibration = {
      speed: undefined,       // meters per second
      widthOfTankInMM: 188,
      widthOfTreadInMM: 44,
    }
    objects.current = {
      angleInRadians: 0          
      // direction: undefined,   // direction to go if going
      // power: undefined,       // power
      // ordinal                 // ordinal of the current point or the current point that the recent movement started at
    }
    objects.history = []
    objects.calibration.isCalibrated = false
    objects.sonicTest = 5
  }

  isCalibrated() {
    return this._objects.calibration.isCalibrated
  }

  nextOrdinal() {
    return this._objects.ordinal += 1
  }

  currentPoint() {
    if (!this._objects.current.endTime) {
      return null // in motion
    }
    const ordinal = this._objects.current.ordinal
    const lastPoint = this.args.mentions({ context: { marker: 'point' }, condition: (context) => context.ordinal == ordinal })

    const durationInSeconds = (this._objects.current.endTime - this._objects.current.startTime) / 1000
    const speedInMetersPerSecond = (this._objects.current.power / this._objects.calibration.power) * this._objects.calibration.speedForward
    const direction = this._objects.current.direction
    const distanceInMeters = speedInMetersPerSecond * durationInSeconds * (direction == 'forward' ? 1 : -1)
    const angleInRadians = this._objects.current.angleInRadians
    const yPrime = lastPoint.point.y + distanceInMeters * Math.sin(angleInRadians)
    const xPrime = lastPoint.point.x + distanceInMeters * Math.cos(angleInRadians)
    return { x: xPrime, y: yPrime }
  }

  markCurrentPoint() {
    const ordinal = this.nextOrdinal()
    const point = this.currentPoint()
    this.args.mentioned({ marker: 'point', ordinal, point })
    this._objects.current.ordinal = ordinal
    this._objects.current.endTime = null
    this._objects.current.startTime = null
  }

  async sendCommand() {
    const stopAtDistance = async (direction, distanceMeters) => {
      const speed_meters_per_second = direction == 'forward' ? this._objects.calibration.speedForward : this._objects.calibration.speedBackward
      const duration_seconds = distanceMeters / speed_meters_per_second
      await this.pause(duration_seconds, { batched: true })
      await this.stop()
      this.markCurrentPoint()
    }

    if (this._objects.current.destination) {
      const currentPoint = this.args.mentions({ context: { marker: 'point' } })
      const polar = cartesianToPolar(currentPoint.point, this._objects.current.destination.point)
      const destinationAngleInDegrees = radiansToDegrees(polar.angle)
      let angleDelta = destinationAngleInRadians - this._objects.current.angleInRadians
      if (angleDelta > 180) {
        angleDelta -= 360
      } else if (angleDelta < -180) {
        angleDelta += 360
      }
      await this.rotate(angleDelta)
      await this.forward(this._objects.current.power)
      await stopAtDistance(polar.radius)
      return
    }

    const command = { power: this._objects.current.power, ...this._objects.current }
    switch (command.direction) {
      case 'forward':
        await this.forward(command.power, { batched: command.distance })
        break
      case 'backward':
        await this.backward(command.power, { batched: command.distance })
        break
      case 'right':
        await this.rotate(-90)
        break
      case 'left':
        await this.rotate(90)
        break
      case 'around':
        await this.rotate(180)
        break
    }

    if (command.distance) {
      const distanceMeters = command.distance
      await stopAtDistance(command.direction, distanceMeters)
    }
  }

  loadCalibration(calibration) {
    Object.assign(this._objects.calibration, calibration)
    this._objects.current.power = this._objects.calibration.minPower
  }

  // override this to save the calibration to not have to run it over and over again and be annoing. 
  async saveCalibration(calibration) {
    this._objects.history.push({ marker: 'history', saveCalibration: true })
  }

  async forward(power, options) {
    const time = await this.forwardDrone(power, options)
    this._objects.current.startTime = time
    this._objects.current.endTime = null
    return time
  }

  async backward(power, options) {
    const time = await this.backwardDrone(power, options)
    this._objects.current.startTime = time
    this._objects.current.endTime = null
    return time
  }

  async sonic() {
    return await this.sonicDrone()
  }

  // TODO allow saying turn while its moving and make that one moves so you can go back wiggly?
  async left(angleInRadians) {
    await this.rotateDrone(angleInRadians)
    this._objects.current.angleInRadians = (this._objects.current.angleInRadians + angleInRadians) % Math.PI
  }

  async tiltAngle(angle) {
    await tiltAngleDrone(angle)
  }

  async panAngle(angle) {
    await panAngleDrone(angle)
  }

  async stop(options) {
    const time = await this.stopDrone(options)
    this._objects.current.endTime = time
    return time
  }

  async pause(durationInSeconds, options) {
    await this.pauseDrone(durationInSeconds, options)
  }

  // subclass and override the remaining to call the drone

  // this is for testing 
  async pauseDrone(durationInSeconds, options) {
    this._objects.history.push({ marker: 'history', pause: durationInSeconds, ...options })
    this.testDate = new Date(this.testDate.getTime() + (durationInSeconds-1)*1000)
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

  // CMD_MOTOR#1000#1000#
  async forwardDrone(power, options) {
    const time = this.now()
    this._objects.sonicTest -= 1
    this._objects.history.push({ marker: 'history', direction: 'forward', power, time, ...options })
    return time
  }

  async backwardDrone(power, options) {
    const time = this.now()
    this._objects.sonicTest += 1
    this._objects.history.push({ marker: 'history', direction: 'backward', power, time, ...options })
    return time
  }

  // -angle is counterclockwise
  // +angle is clockwise

  async rotateDrone(angle) {
    this._objects.history.push({ marker: 'history', turn: angle })
  }

  // distance in cm
  async sonicDrone() {
    this._objects.history.push({ marker: 'history', sonic: this._objects.sonicTest })
    return this._objects.sonicTest
  }

  async tiltAngleDrone(angle) {
  }

  async panAngleDrone(angle) {
  }

  async stopDrone(options) {
    const time = this.now()
    this._objects.history.push({ marker: 'history', power: 0, time, ...options })
    return time
  }
}

const howToCalibrate = "Put an object in front of the drone. When you are ready say calibrate."

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

// expectProperty
function expectDirection(args) {
  args.config.addSemantic({
    match: ({context, isA}) => isA(context.marker, 'direction'),
    apply: ({objects, context}) => {
      objects.runCommand = true
      objects.current.direction = context.marker
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
      objects.runCommand = true
      objects.current.distance = result.evalue.amount.evalue.evalue
    }
  })
}

const template = {
  fragments: [ 
    "quantity in meters",
    "quantity in meters per second",
  ],
  configs: [
    "drone is a concept",
    //TODO "forward left, right, backward are directions",
    "around, forward, left, right, and backward are directions",
    "speed and power are properties",
    "point is a concept",
    // TODO fix/add this "position means point",
    "points are nameable orderable and memorable",
    (args) => {
      expectDirection(args)
      expectDistanceForMove(args)

      args.config.addSemantic({
        match: ({context, isA}) => isA(context.marker, 'quantity') && isA(context.unit.marker, 'unitPerUnit'),
        apply: async ({context, objects, api, fragments, e}) => {
          // send a command to the drone
          const instantiation = await fragments("quantity in meters per second", { quantity: context })
          const result = await e(instantiation)
          const desired_speed = result.evalue.amount.evalue.evalue
          const desired_power = objects.current.power * (desired_speed / objects.calibration.speedForward)
          objects.runCommand = true
          objects.current.power = desired_power 
        }
      })

      args.config.addSemantic({
        match: ({context, objects, isA}) => objects.current.direction && objects.calibration.isCalibrated && context.marker == 'controlStart',
        apply: ({context, objects, api}) => {
          objects.runCommand = false  
        }
      })

      args.config.addSemantic({
        // match: ({context, objects, isA}) => objects.current.direction && objects.calibration.isCalibrated && (context.marker == 'controlEnd' || context.marker == 'controlBetween'),
        match: ({context, objects, isA}) => objects.current.direction && objects.calibration.isCalibrated && context.marker == 'controlEnd',
        apply: async ({context, objects, api}) => {
          // send a command to the drone
          if (objects.runCommand) {
            await api.sendCommand()
          }
        }
      })
    },
    {
      operators: [
        "([calibrate])",
        "([turn] (direction))",
        "([pause] ([number]))",
        "([stop] ([drone|])?)",
        "([go])",
        "([toPoint|to] (point))",
      ],
      bridges: [
        { 
          id: "toPoint",
          isA: ['preposition'],
          bridge: "{ ...next(operator), operator: operator, point: after[0], interpolate: [{ property: 'operator' }, { property: 'point' }] }",
          semantic: async ({objects, api, e, context}) => {
            if (api.isCalibrated()) {
              objects.runCommand = true
              const point = await e(context.point)
              objects.current.destination = point.evalue
            }
          }
        },
        { id: "go" },
        {
          id: 'turn',
          isA: ['verb'],
          bridge: "{ ...next(operator), direction: after[0], interpolate: [{ context: operator }, { property: 'direction' }] }",
          semantic: ({context, objects, api}) => {
            objects.runCommand = true
            objects.current.direction = context.direction.marker
          },
          // check: { marker: 'turn', exported: true, extra: ['direction'] }
        },
        {
          id: 'calibrate',
          words: ['configure'],
          isA: ['verb'],
          bridge: "{ ...next(operator), interpolate: [{ context: operator }] }",
          semantic: async ({context, objects, api, mentioned}) => {
            let power = 20
            const moveTimeInSeconds = 0.5
            let distanceInCM = 0
            let startBackward
            for (; power < 30; ++power) {
              const start = await api.sonic();
              await api.forward(power, { batched: true })
              await api.pause(moveTimeInSeconds, { batched: true })
              await api.stop()
              const end = await api.sonic();
              if (end !== start) {
                distanceInCM = start - end
                startBackward = end
                break;
              }
            }

            const metersPerSecondForward = (distanceInCM/100)/moveTimeInSeconds

            // reset

            await api.backward(power, { batched: true })
            await api.pause(moveTimeInSeconds, { batched: true })
            await api.stop()
            const endBackward = await api.sonic();

            const metersPerSecondBackward = ((endBackward-startBackward)/100)/moveTimeInSeconds
    
            // console.log(`Distance ${distance} cm`)
            // console.log(`Time ${moveTime} ms`)
            // console.log(`M/S ${metersPerSecond}`)

            objects.calibration.minPower = power
            objects.calibration.power = power
            objects.current.power = power
            objects.calibration.speedForward = metersPerSecondForward
            objects.calibration.speedBackward = metersPerSecondBackward
            objects.calibration.isCalibrated = true

            const ordinal = api.nextOrdinal()
            mentioned({ marker: 'point', ordinal, point: { x: 0, y: 0 }, description: "start" })
            objects.current.ordinal = ordinal

            api.saveCalibration(objects.calibration)
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
            1: "{ marker: 'drone' }",
          },
          bridge: "{ ...next(operator), object: after[0], interpolate: [{ context: operator }, { property: 'object' }] }",
          semantic: async ({mentioned, context, objects, api, say}) => {
            if (!objects.calibration.startTime) {
              return // ignore
            }
            if (objects.calibration.speedForward) {
              await api.stop()
              api.markCurrentPoint()
            } else {
              const stopTime = await api.stop()
              objects.calibration.endTime = stopTime
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
      semantics: [
      
      ],
    },
  ],
}

knowledgeModule( { 
  config: { name: 'drone' },
  includes: [nameable, ordinals, hierarchy, rates, help],
  api: () => new API(),

  module,
  description: 'controlling a drone',
  test: {
    name: './drone.test.json',
    contents: drone_tests,
    checks: {
      context: [
        defaultContextCheck({ marker: 'point', exported: true, extra: ['ordinal', { property: 'point', check: ['x', 'y'] }, 'description', { property: 'stm', check: ['id', 'names'] }] }),
        defaultContextCheck({ marker: 'turn', exported: true, extra: ['direction'] }),
        defaultContextCheck({ marker: 'history', exported: true, extra: ['pause', 'direction', 'power', 'turn', 'time', 'sonic', 'saveCalibration', 'batched'] }),
        defaultContextCheck(),
      ],
      objects: [
        { km: 'stm' },
        { path: ['isCalibrated'] }, 
        { path: ['calibration'] }, 
        { path: ['history'] },
        { path: ['current'] },
        { path: ['runCommand'] },
      ],
    }
  },
  instance,
  template,
})
