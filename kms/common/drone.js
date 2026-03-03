const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { conjugateVerb } = require('./english_helpers')
const { OverrideCheck, defaultContextCheck, getValue, setValue } = require('./helpers')
const drone_tests = require('./drone.test.json')
const instance = require('./drone.instance.json')
const hierarchy = require('./hierarchy')
const ordinals = require('./ordinals')
const nameable = require('./nameable')
const compass = require('./compass')
const angle = require('./angle')
const rates = require('./rates')
const help = require('./help')
const { rotateDelta, degreesToRadians, radiansToDegrees, cartesianToPolar } = require('./helpers/drone')

/*
DONE turn right 2 times\nturn around <- no reset of times
DONE lower/raise the claw
again

call the first point the start
180 degree turns not working
go 20 percent faster
lower and raise crane
round to 2 digits

DONE turn right 45 degrees
DONE turn right 2 times

go north 1 foot east 1 foot south 1 foot west 1 foot. call this square 2. do square 2 two times

turn left go forward 1 foot <- the turn is lost

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

  you are facing north. patrol between here and 100 feet to the west
  this way is south

  go forward for 1 second\nbackward 2 meters (implicit stop)

  go back

  go back and forth 3 times
  go back and forth 2 meters
  go back and forth 1 second

  what is the default speed
  increase that by 2 times/20 percent/2 inches per second
  amke the default speed 2 times faster
  double the default speed  

  what is the speed
  use inches per second and repeat that
*/

function expectDirection(args) {
  args.config.addSemantic({
    match: ({context, isA}) => isA(context.marker, 'direction') && !context.evaluate,
    apply: ({objects, context}) => {
      objects.runCommand = true
      objects.current.direction = context.marker
    }
  })
}

// it's lazy day

const compassToRadians = {
  'north':      0,
  'northwest':  Math.PI / 4,
  'west':       Math.PI / 2,
  'southwest':  3 * Math.PI / 4,
  'south':      Math.PI,
  'southeast':  5 * Math.PI / 4,
  'east':       3 * Math.PI / 2,
  'northeast':  7 * Math.PI / 4
};

async function handleDistance(args, distance) {
  const {objects, fragments, e, say, gp} = args
  if (!distance) {
    distance = args.context
  }
  const instantiation = await fragments("quantity in meters", { quantity: distance })
  try {
    const result = await e(instantiation)
    objects.runCommand = true
    objects.current.distance = result.evalue.amount.evalue.evalue
  } catch (e) {
    say(`Don't know how to interpret ${await gp(distance)} in meters`)
  }
}

function expectDistanceForMove(args) {
  args.config.addSemantic({
    match: ({context, isA}) => isA(context.marker, 'quantity') && context.unit && !isA(context.unit.marker, 'unitPerUnit'),
    match: ({context, isA}) => isA(context.marker, 'quantity') && context.unit && isA(context.unit.dimension, 'length'),
    apply: async (args) => {
      await handleDistance(args)
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
    const overrideMethods = Object.getOwnPropertyNames(API.prototype).filter(key => typeof API.prototype[key] === 'function' && key.endsWith('Drone'));
    this.overrideCheck = new OverrideCheck(API, overrideMethods)
    this.overriden = this.constructor !== API
  }

  initialize({ objects }) {
    if (this.overriden) {
      this.overrideCheck.check(this)
    }

    if (!this.minimumSpeedDrone()) {
      throw new Error(`minimumSpeedDrone is not returning a positive number. Its returning ${this.minimumSpeedDrone()}`)
    }

    if (!this.maximumSpeedDrone()) {
      throw new Error(`maximumSpeedDrone is not returning a positive number. Its returning ${this.maximumSpeedDrone()}`)
    }

    this._objects = objects
    this._objects.defaultTime = { hour: 9, minute: 0, second: 0, millisecond: 0 }
    delete this.testDate

    objects.current = {
      angleInRadians: 0,
      path: [],
      speed: this.minimumSpeedDrone(),
      ordinal: 0,                 // ordinal of the current point or the current point that the recent movement started at
      compass: 'north',           // for now assume the drone start out point north. i will make that part of the conversation later
      direction: 'forward',
    }
    objects.history = []
    objects.sonicTest = 5

    this.args.mentioned({ marker: 'point', ordinal: this.nextOrdinal(), point: { x: 0, y: 0 }, description: "start" })
  }

  currentOrdinal() {
    return this._objects.current.ordinal
  }

  nextOrdinal() {
    return this._objects.current.ordinal += 1
  }

  currentPoint() {
    const current = this._objects.current
    if (current.durationInSeconds) {
      // okay
    } else if (!current.startTime || !current.endTime) {
      return null // in motion
    }
    const ordinal = this.currentOrdinal()
    const lastPoint = this.args.mentions({ context: { marker: 'point' }, condition: (context) => context.ordinal == ordinal })
    if (!current.startTime && !current.endTime && !current.durationInSeconds) {
      return lastPoint // did not move
    }

    let durationInSeconds
    if (current.durationInSeconds) {
      durationInSeconds = current.durationInSeconds
    } else {
      durationInSeconds = (current.endTime - current.startTime) / 1000
    }
    const speedInMetersPerSecond = current.speed
    const direction = current.direction
    const distanceInMeters = speedInMetersPerSecond * durationInSeconds * (direction == 'forward' ? 1 : -1)
    const angleInRadians = current.angleInRadians
    const yPrime = lastPoint.point.y + distanceInMeters * Math.sin(angleInRadians)
    const xPrime = lastPoint.point.x + distanceInMeters * Math.cos(angleInRadians)
    return { x: xPrime, y: yPrime }
  }

  markCurrentPoint() {
    const point = this.currentPoint()
    if (!point) {
      return
    }
    const ordinal = this.nextOrdinal()
    this.args.mentioned({ marker: 'point', ordinal, point })
    this._objects.current.endTime = null
    this._objects.current.startTime = null
  }

  async sendCommand() {
    if (!this._objects.runCommand) {
      return
    }

    delete this._objects.runCommand
    const objects = this._objects
    const { fragments, e, say, gr } = this.args

    async function quantityInMeters(from, to) {
      const fi = await fragments("quantity in meters")
      return await fi.instantiate([
        { 
          match: ({path, pathEquals}) => pathEquals(path, ['0', 'from']),
          apply: ({context}) => Object.assign(context, from),
        },
        { 
          match: ({path, pathEquals}) => pathEquals(path, ['0', 'to']),
          apply: ({context}) => Object.assign(context, to),
        },
      ])
    }

    // TODO account for forward vs backward speed
    const minimumSpeed = this.minimumSpeedDrone()
    if (objects.current.speed < minimumSpeed) {
      const unitsOfUser = objects.current.speedUnitsOfUser
      const minimumValueInDroneUnits = await fragments("number meters per second", { number: { marker: 'integer', value: minimumSpeed } })
      // const valueInUsersUnits = await fragments("quantity in meters", { quantity: minimumValueInDroneUnits, meter: unitsOfUser })
      const valueInUsersUnits = await quantityInMeters(minimumValueInDroneUnits, unitsOfUser )
      const evaluated = await e(valueInUsersUnits)
      say(`The drone cannot go that slow. The minimum speed is ${await gr(evaluated.evalue)}`)
      objects.runCommand = false
      objects.current.speed = minimumSpeed
      return
    }

    // TODO account for forward vs backward speed
    const maximumSpeed = this.maximumSpeedDrone()
    if (objects.current.speed > maximumSpeed) {
      const unitsOfUser = objects.current.speedUnitsOfUser
      const maximumValueInDroneUnits = await fragments("number meters per second", { number: { marker: 'integer', value: maximumSpeed } })
      // const valueInUsersUnits = await fragments("quantity in meters", { quantity: maximumValueInDroneUnits, meter: unitsOfUser })
      const valueInUsersUnits = await quantityInMeters(maximumValueInDroneUnits, unitsOfUser )
      const evaluated = await e(valueInUsersUnits)
      say(`The drone cannot go that fast. The maximum speed is ${await gr(evaluated.evalue)}`)
      objects.runCommand = false
      objects.current.speed = minimumSpeed
      return
    }

    const stopAtDistance = async (direction, distanceMeters) => {
      const speed_meters_per_second = objects.current.speed
      objects.current.durationInSeconds = distanceMeters / speed_meters_per_second
      await this.pause(objects.current.durationInSeconds, { batched: true })
      await this.stop({ batched: true })
      this.markCurrentPoint()
    }

    if (objects.current.path.length > 0) {
      if (objects.current.timeRepeats) {
        this.startRepeats(objects.current.timeRepeats)
      }
      let currentPoint = this.args.mentions({ context: { marker: 'point' } }).point
      for (const destination of objects.current.path) {
        const destinationPoint = destination.point
        if (currentPoint.x == destinationPoint.x && currentPoint.y == destinationPoint.y) {
          // already there
        } else {
          const polar = cartesianToPolar(currentPoint, destinationPoint)
          const destinationAngleInRadians = polar.angle
          const angleDelta = (destinationAngleInRadians - objects.current.angleInRadians)
          await this.rotate(angleDelta, { batched: true })
          if (!destination.aimOnly) {
            await this.forward(objects.current.speed, { batched: true })
            await stopAtDistance("forward", polar.radius)
          }
        }
        currentPoint = destinationPoint
      }
      if (objects.current.timeRepeats) {
        await this.endRepeats()
      }
      await this.sendBatch()
      objects.current.path = []
      objects.current.timeRepeats = 0
      objects.current.durationInSeconds = 0
      return
    }
    const command = { speed: objects.current.speed, ...objects.current }
    if (this.args.hierarchy.isA(command.direction, 'compass_direction') || ['left', 'right', 'around'].includes(command.direction)) {
      let delta = 0
      if (command.direction == 'right') {
        delta = -objects.current.turnAngle || -Math.PI/2
      } else if (command.direction == 'left') {
        delta = objects.current.turnAngle || Math.PI/2
      } else if (command.direction == 'around') {
        delta = Math.PI
      } else {
        delta = rotateDelta(objects.current.angleInRadians, compassToRadians[command.direction])
      }
     
      const repeats = objects.current.timeRepeats || 1
      for (let i = 0; i < repeats; ++i) {
        await this.rotate(delta, { batched: true })
      }

      if (!objects.current.justTurn) {
        await this.forward(command.speed, { batched: command.distance })
      } else {
        await this.sendBatch()
      }
      delete objects.current.justTurn
      delete objects.current.turnAngle
      delete objects.current.timeRepeats
    } else {
      switch (command.direction) {
        case 'forward':
        case undefined:
          await this.forward(command.speed, { batched: command.distance })
          break
        case 'backward':
          await this.backward(command.speed, { batched: command.distance })
          break
        case 'right':
          await this.rotate(-Math.PI/2)
          break
        case 'left':
          await this.rotate(Math.PI/2)
          break
        case 'around':
          await this.rotate(Math.PI)
          break
      }
    }

    if (command.distance > 0) {
      const distanceMeters = command.distance
      await stopAtDistance(command.direction, distanceMeters)
      await this.sendBatch()
      objects.current.durationInSeconds = 0
      objects.current.distance = 0
    }
  }

  async startRepeats(n) {
    await this.startRepeatsDrone(n)
  }

  async endRepeats(n) {
    await this.endRepeatsDrone()
  }

  async sendBatch() {
    await this.sendBatchDrone()
  }

  async armAction(action) {
    return this.armActionDrone(action)
  }

  async clawAction(action) {
    return this.clawActionDrone(action)
  }

  async forward(speed, options) {
    await this.forwardDrone(speed, options)
    const time = this.now()
    this._objects.current.startTime = time
    this._objects.current.endTime = null
    return time
  }

  async backward(speed, options) {
    await this.backwardDrone(speed, options)
    const time = this.now()
    this._objects.current.startTime = time
    this._objects.current.endTime = null
    return time
  }

  async sonic() {
    return await this.sonicDrone()
  }

  // TODO allow saying turn while its moving and make that one moves so you can go back wiggly?
  async rotate(angleInRadians, options) {
    await this.rotateDrone(angleInRadians, options)
    this._objects.current.angleInRadians = (this._objects.current.angleInRadians + angleInRadians) % (2*Math.PI)
  }

  async tiltAngle(angle) {
    await tiltAngleDrone(angle)
  }

  async panAngle(angle) {
    await panAngleDrone(angle)
  }

  async stop(options) {
    await this.stopDrone(options)
    const time = this.now()
    if (this._objects.current.startTime) {
      this._objects.current.endTime = time
    }
    return time
  }

  async pause(durationInSeconds, options) {
    await this.pauseDrone(durationInSeconds, options)
  }

  // subclass and override the remaining to call the drone

  async armActionDrone(action) {
    this._objects.history.push({ marker: 'history', armAction: action })
  }

  async clawActionDrone(action) {
    this._objects.history.push({ marker: 'history', clawAction: action })
  }

  async startRepeatsDrone(n) {
    this._objects.history.push({ marker: 'history', repeats: n })
  }

  async endRepeatsDrone(n) {
    this._objects.history.push({ marker: 'endRepeats', })
  }

  async sendBatchDrone(durationInSeconds, options) {
    this._objects.history.push({ marker: 'sendBatch', pause: durationInSeconds, ...options })
  }

  async pauseDrone(durationInSeconds, options) {
    this._objects.history.push({ marker: 'history', pause: durationInSeconds, ...options })
    this.testDate = new Date(this.testDate.getTime() + (durationInSeconds-1)*1000)
  }

  // meters per second
  minimumSpeedDrone() {
    return 0.25
  }

  // meters per second
  maximumSpeedDrone() {
    return 1.2
  }

  now(lookahead = false) {
    if (this.args.isProcess || this.args.isTest) {
      if (!this.testDate) {
        this.testDate = new Date(2025, 5, 29, 14, 52, 0)
      }
      if (lookahead) {
        return new Date(this.testDate.getTime() + 1000)
      } else {
        this.testDate = new Date(this.testDate.getTime() + 1000)
        return this.testDate
      }
    } else {
      return new Date()
    }
  }

  // CMD_MOTOR#1000#1000#
  async forwardDrone(speed, options) {
    this._objects.sonicTest -= 10 // make the speed about the same as the actual drone
    this._objects.history.push({ marker: 'history', direction: 'forward', speed, time: this.now(true), ...options })
  }

  async backwardDrone(speed, options) {
    this._objects.sonicTest += 10 // make the speed about the same as the actual drone
    this._objects.history.push({ marker: 'history', direction: 'backward', speed, time: this.now(true), ...options })
  }

  // -angle is counterclockwise
  // +angle is clockwise

  async rotateDrone(angleInRadians, options) {
    this._objects.history.push({ marker: 'history', time: this.now(true), turn: angleInRadians, ...options })
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
    this._objects.history.push({ marker: 'history', speed: 0, time: this.now(true), ...options })
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
/*
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
*/

const template = {
  fragments: [ 
    "quantity in meters",
    "quantity in meters per second",
    "number meters per second",
    "quantity in units",
    "number degrees",
    "40 degrees in radians",
    "path",
  ],
  configs: [
    "arm, claw and drone are concepts",
    //TODO "forward left, right, backward are directions",
    "around, forward, left, right, and backward are directions",
    "paths are nameable and memorable",
    {
      hierarchy: [
        ['thisitthat', 'path'],
      ],
    },
    "speed and power are properties",
    "speed and power are comparable",
    "speed is a quantity",
    "point is a concept",
    // TODO fix/add this "position means point",
    "points are nameable orderable and memorable",
    "drone modifies direction",
    (args) => {
      expectDirection(args)
      expectDistanceForMove(args)

      args.config.addSemantic({
        match: ({context, isA}) => isA(context.marker, 'quantity') && isA(context.unit?.marker, 'unitPerUnit'),
        apply: async ({context, objects, api, gr, fragments, e, say}) => {
          // send a command to the drone
          const instantiation = await fragments("quantity in meters per second", { quantity: context })
          const result = await e(instantiation)
          const desired_speed = result.evalue.amount.evalue.evalue
          objects.runCommand = true
          objects.current.speed = desired_speed
          objects.current.speedUnitsOfUser = context.unit
        }
      })

      args.config.addSemantic({
        match: ({context, objects, isA}) => objects.current.direction && context.marker == 'controlStart',
        apply: ({context, objects, api}) => {
          objects.runCommand = false  
        }
      })

      args.config.addSemantic({
        match: ({context, objects, isA}) => objects.current.direction && context.marker == 'controlEnd',
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
        "([do] (path))",
        "([lift|lift,raise] (@<= arm || @<= claw))",
        "([lower] (@<= arm || @<=claw))",
        "([open] (claw))",
        "([close] (claw))",
        "([back])",
        "([forth])",
        // "([turn] (direction))",
        "([pause] ([number]))",
        "([stop] ([drone|])?)",
        "([toPoint|to] (point))",
      ],
      bridges: [
        {
          id: 'do',
          isA: ['verb'],
          bridge: `{
            ...next(operator), operator: operator, path: after[0], interpolate: [{ property: 'operator'}, { property: 'path' }]
          }`,
          semantic: async ({context, e, toEValue, objects}) => {
            const evaluated = await(e(context.path))
            const path = toEValue(evaluated)
            for (const point of path.points) {
              objects.current.path.push(point)
            }
            objects.runCommand = true
          }
        },
        {
          id: 'lift',
          isA: ['verb'],
          bridge: `{
            ...next(operator), operator: operator, object: after[0], interpolate: [{ property: 'operator'}, { property: 'object' }]
          }`,
          semantic: ({api}) => {
            api.armAction('up')
          }
        },
        {
          id: 'lower',
          isA: ['verb'],
          bridge: `{
            ...next(operator), operator: operator, object: after[0], interpolate: [{ property: 'operator'}, { property: 'object' }]
          }`,
          semantic: ({api}) => {
            api.armAction('down')
          }
        },
        {
          id: 'open',
          isA: ['verb'],
          bridge: `{
            ...next(operator), operator: operator, object: after[0], interpolate: [{ property: 'operator'}, { property: 'object' }]
          }`,
          semantic: ({api}) => {
            api.clawAction('open')
          }
        },
        {
          id: 'close',
          isA: ['verb'],
          bridge: `{
            ...next(operator), operator: operator, object: after[0], interpolate: [{ property: 'operator'}, { property: 'object' }]
          }`,
          semantic: ({api}) => {
            api.clawAction('close')
          }
        },
        {
          id: "back",
          isA: ['noun'],
          semantic: async ({objects, mentions, api, e, context}) => {
            objects.runCommand = true
            const ordinal = api.currentOrdinal() - 1
            const lastPoint = mentions({ context: { marker: 'point' }, condition: (context) => context.ordinal == ordinal })
            objects.current.path.push(lastPoint)
          }
        },
        {
          id: "forth",
          isA: ['noun'],
        },
        { 
          id: "toPoint",
          isA: ['preposition'],
          bridge: "{ ...next(operator), operator: operator, point: after[0], interpolate: [{ property: 'operator' }, { property: 'point' }] }",
          semantic: async ({objects, api, e, context}) => {
            objects.runCommand = true
            const point = await e(context.point)
            objects.current.path.push(point.evalue)
          }
        },
        { 
          id: "go",
          level: 0,
          isA: ['verb'],
          words: [
            ...conjugateVerb('go'),
          ],
          bridge: `{ 
            ...next(operator), 
            distance: distance?, 
            direction: direction?,
            operator: operator,
            interpolate: [{ property: 'operator' }, { property: 'direction' }, { property: 'distance' }] 
          }`,
          selector: {
            arguments: {
              distance: "(@<= 'quantity' && context.unit.dimension == 'length')",
              direction: "(@<= 'direction')",
            },
          },
          semantic: async (args) => {
            const {context, objects} = args
            if (context.distance) {
              await handleDistance(args, context.distance)
            }
            if (context.direction) {
              objects.current.direction = context.direction.marker
            }
            objects.runCommand = true
          },
        },
        {
          id: 'turn',
          isA: ['verb'],
          words: ['turn'],
          bridge: `{ 
            ...next(operator), 
            direction: direction, 
            repeats: repeats?, 
            angle: angle?,
            interpolate: [{ context: operator }, { property: 'direction' }, { property: 'angle' }, { property: 'repeats' }] }
          `,
          selector: {
            arguments: {
              direction: "(@<= 'direction')",
              repeats: "(@<= 'timeRepeats')",
              angle: "(@<= 'quantity' && context.unit.dimension == 'angle')",
            },
          },
          semantic: async ({context, fragments, objects, e, s, api, say, toFinalValue}) => {
            const current = objects.current
            current.direction = context.direction.marker
            if (context.repeats) {
              current.timeRepeats = toFinalValue(context.repeats.repeats)
            }
            const toRadians = async (angle) => {
              const fi = await fragments("40 degrees in radians")
              return await fi.instantiate([
                { 
                  match: ({path, pathEquals}) => pathEquals(path, ['0', 'from']),
                  apply: ({context}) => {
                    Object.assign(context, angle)
                  }
                }
              ])
            }
            if (context.angle) {
              const instantiation = await toRadians(context.angle)
              try {
                const result = await e(instantiation)
                current.turnAngle = toFinalValue(result.evalue.amount)
                objects.runCommand = true
              } catch (e) {
                say(`Don't know how to interpret ${await gp(context.angle)} in radians`)
                return
              }
            }
            current.justTurn = true
            objects.runCommand = true
            await api.sendCommand()
          },
          // check: { marker: 'turn', exported: true, extra: ['direction'] }
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
            await api.stop()
            api.markCurrentPoint()
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
        {
          match: ({context}) => context.marker == 'path' && context.pullFromContext && context.evaluate,
          apply: async ({context, fragments, stm, objects, mentioned, mentions, resolveEvaluate, _continue}) => {
            const points = mentions({ context: { marker: 'point' }, all: true })
            const path = (await fragments('path')).contexts()[0]
            path.points = points
            // resolveEvaluate(context, path)
            await mentioned(path)
            _continue()
          },
        },
        {
          match: ({context}) => context.marker == 'thenTime',
          apply: async ({objects, api}) => {
            if (objects.runCommand) {
              await api.sendCommand()
            }
          },
        },
        {
          match: ({context}) => context.marker == 'speed' && context.evaluate,
          apply: async ({gp, s, context, objects, fragments, resolveEvaluate, api}) => {
            let value = objects.current.speed
            if (context.condition) {
              if (['highest', 'maximum'].includes(context.condition.marker)) {
                value = api.maximumSpeedDrone()
              } else if (['lowest', 'minimum'].includes(context.condition.marker)) {
                value = api.minimumSpeedDrone()
              }
            }
            const speed = await fragments("number meters per second", { number: { marker: 'integer', value } })
            const preferred = await s({ marker: 'preferredUnits', quantity: speed }) 
            resolveEvaluate(context, preferred.response || speed)
          }
        },
        {
          match: ({context}) => ['direction', 'drone_direction'].includes(context.marker) && context.evaluate,
          apply: async ({gp, s, context, objects, fragments, resolveEvaluate, api}) => {
            const value = objects.current.angleInRadians
            const fi = await fragments("number degrees")
            const direction = await fi.instantiate([
              { 
                match: ({path, pathEquals}) => pathEquals(path, ['0', 'amount']),
                apply: ({context}) => {
                  Object.assign(context, { marker: 'number', value: value })
                }
              }
            ])
            resolveEvaluate(context, direction)
          }
        },
        {
          match: ({context}) => context.marker == 'timeRepeats',
          apply: ({context, objects, toFinalValue}) => {
            objects.current.timeRepeats = toFinalValue(context.repeats)
          }
        },
        {
          match: ({context, toArray}) => {
            if (context.marker !== 'list') {
              return false
            }

            const array = toArray(context)
            if (array[0].marker == 'back' && array[1].marker == 'forth') {
              return true
            }
          },
          apply: ({context, objects, api, mentions}) => {
            objects.runCommand = true
            objects.current.backAndForth = true
            const ordinal = api.currentOrdinal()
            const currentPoint = mentions({ context: { marker: 'point' }, condition: (context) => context.ordinal == ordinal })
            const lastPoint = mentions({ context: { marker: 'point' }, condition: (context) => context.ordinal == ordinal-1 })
            objects.current.path.push(lastPoint)
            objects.current.path.push(currentPoint)
            // objects.current.path.push({ ...lastPoint, aimOnly: true })
          }
        }
      ],
    },
  ],
}

knowledgeModule( { 
  config: { name: 'drone' },
  includes: [angle, compass, nameable, ordinals, hierarchy, rates, help],
  api: () => new API(),

  module,
  description: 'controlling a drone',
  test: {
    name: './drone.test.json',
    contents: drone_tests,
    checks: {
      context: [
        defaultContextCheck({ marker: 'path', exported: true, extra: ['points', { property: 'stm', check: ['id', 'names'] }] }),
        defaultContextCheck({ marker: 'go', exported: true, extra: ['direction', 'distance'] }),
        defaultContextCheck({ marker: 'point', exported: true, extra: ['ordinal', { property: 'point', check: ['x', 'y'] }, 'description', { property: 'stm', check: ['id', 'names'] }] }),
        defaultContextCheck({ marker: 'turn', exported: true, extra: ['direction', 'repeats'] }),
        defaultContextCheck({ marker: 'history', exported: true, extra: ['pause', 'direction', 'speed', 'turn', 'time', 'sonic', 'batched', 'repeats', 'armAction', 'clawAction'] }),
        defaultContextCheck(),
      ],
      objects: [
        { km: 'stm' },
        { path: ['history'] },
        { path: ['current'] },
        { path: ['runCommand'] },
      ],
    }
  },
  instance,
  template,
})
