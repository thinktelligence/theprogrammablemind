const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { conjugateVerb } = require('./english_helpers')
const { OverrideCheck, defaultContextCheckProperties, defaultContextCheck, getValue, setValue } = require('./helpers')
const drone_tests = require('./drone.test.json')
const instance = require('./drone.instance.json')
const hierarchy = require('./hierarchy')
const ordinals = require('./ordinals')
const nameable = require('./nameable')
const compass = require('./compass')
const actions = require('./actions')
const angle = require('./angle')
const rates = require('./rates')
const help = require('./help')
const { rotateDelta, degreesToRadians, radiansToDegrees, cartesianToPolar, smallestRotate } = require('./helpers/drone')

/*
NEED TO CHECK ON ACTUAL DRONE

  DONE fix DO so it can do all the stuff partol can do <<<<<<<<<<<<<<<<<<<
  start again. start a new path
  the last 3 points are called path 1

  stopping 2 seconds at each point
  patrols x do that again
  DONE go to the end of the patrol
  DONE patrol x three times
  patrol x continuously
  patrol x for 5 minutes
  go to the start
  DONE node drone -q 'north 1 meter\neast 1 meter\ncall that route 2\nwhat is the second point of route 2' -g -

  go to the start along the path / following the path
  pausing 1 second at the first point and 5 at the last

  DONE go to the second point of route 1
  DONE do route 1 pausing 10 seconds at each point

  what is the drone's position
DONE go back
go back another point
go back again
go back to the start
go back 2 points along route 1
go to the start of route 2

go forward 1 foot\nturn left\ngo forward again\n
                              do it again
do route 1 skipping point 2

TODO should there be two hierarchy one as a concept car is a vehicle and one as a word car is a noun

turn left\nturn back

DONE do route 1 pausing 10 seconds at each point
do route 1 pausing 1 second at point 1 and 2 seconds for the rest

forward 1 foot\nwest 1 foot\ngo back to the start         <<<<<<<<  turn the longer way not he shorter way
forward 1 foot\nwest 1 foot\ncall the path route 1\ngo to the start of route 1\npatrol route 1\npatrol route 1   <<<<< does the patrol more than once
call that route 1
what are the paths
list the paths

?? elipses of the verb go or some kind of conjunction?!?!?
go forward 1 meter turn right forward 2 meters stop

the patrol called patrol 1 is forward 1 meter pause 10 second west 1 meter pause again then back to the start

do a 5 second pause at each point / add a 10 second pause to each point / pause of 5 seconds

start again / start here / starting here / restart
again
go back to the start => follows path | go to the start => does not follow the path | go to the start following the path
go back 2 points/turns
go back and forth to the start!?!?

call the first point the start
180 degree turns not working
go 20 percent faster
lower and raise crane
round to 2 digits

DONE turn left go forward 1 foot <- the turn is lost
DONE call this patrol 1
DONE call this path patrol 1
DONE call that patrol 1
DONE call that path patrol 1
DONE the start of patrol 1
DONE the end of patrol 1
DONE turn right 45 degrees
DONE turn right 2 times
DONE turn right 2 times\nturn around <- no reset of times
DONE lower/raise the claw
DONE go to the start/end of patrol 1 not working

go north 1 foot east 1 foot south 1 foot west 1 foot. call this square 2. do square 2 two times


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

  use it to measure distances -> go forward. stop. how far was that

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

#  what is the speed
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
  'north':      Math.PI / 2,          //  90°  → north
  'northeast':  Math.PI / 4,          //  45°  → northeast
  'east':       0,                    //   0°  → east
  'southeast':  -Math.PI / 4,         // -45°  → southeast
  'south':      -Math.PI / 2,         // -90°  → south
  'southwest':  -3 * Math.PI / 4,     // -135° → southwest
  'west':       Math.PI,              // 180°  → west  (or -Math.PI, same angle)
  'northwest':  3 * Math.PI / 4       // 135°  → northwest
};

function roundTo(num, decimals = 2) {
  const factor = 10 ** decimals;           // or Math.pow(10, decimals)
  return Math.round(num * factor) / factor;
}

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

  90R means 90 degrees in radians

                   N

                   ^
                   y
                   |
                  90R
                   |
   W -180R/180R <--^--> 0R -- x -> E
                   |
                  -90R

                   S
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
    this.startPoint = { x: 0, y: 0 }
    this.startAngle = Math.PI/2
    this.startCompass = 'north'
  }

  setStartPoint(point) {
    this.startPoint = point
  }

  setStartAngle(angleInRadians, compass) {
    this.startAngle = angleInRadians
    this.startCompass = compass
  }

  setSpeed(metersPerSecond) {
    this._objects.current.speed = metersPerSecond
  }

  initialize({ objects }) {
    if (this.overriden) {
      this.overrideCheck.check(this)
    }

    if (this.minimumSpeedDrone() == null) {
      throw new Error(`minimumSpeedDrone is not returning a positive number. Its returning ${this.minimumSpeedDrone()}`)
    }

    if (this.maximumSpeedDrone() == null) {
      throw new Error(`maximumSpeedDrone is not returning a positive number. Its returning ${this.maximumSpeedDrone()}`)
    }

    this._objects = objects
    this._objects.defaultTime = { hour: 9, minute: 0, second: 0, millisecond: 0 }
    delete this.testDate

    objects.current = {
      angleInRadians: this.startAngle,
      path: [],
      speed: this.minimumSpeedDrone(),
      ordinal: 0,                 // ordinal of the current point or the current point that the recent movement started at
      compass: this.startCompass,
      direction: 'forward',
    }
    objects.history = []
    objects.sonicTest = 5

    this.args.remember({ marker: 'point', ordinal: this.nextOrdinal(), point: this.startPoint, description: "start" })
  }

  currentOrdinal() {
    return this._objects.current.ordinal
  }

  nextOrdinal() {
    return this._objects.current.ordinal += 1
  }

  async currentPoint() {
    const current = this._objects.current
    if (current.durationInSeconds) {
      // okay
    } else if (!current.startTime || !current.endTime) {
      return null // in motion
    }
    const ordinal = this.currentOrdinal()
    const lastPoint = await this.args.recall({ context: { marker: 'point' }, condition: (context) => context.ordinal == ordinal })
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
    const distanceInMeters = Math.abs(speedInMetersPerSecond * durationInSeconds * (direction == 'forward' ? 1 : -1))
    const angleInRadians = current.angleInRadians
    const yPrime = roundTo(lastPoint.point.y + distanceInMeters * Math.sin(angleInRadians), 2)
    const xPrime = roundTo(lastPoint.point.x + distanceInMeters * Math.cos(angleInRadians), 2)
    return { x: xPrime, y: yPrime }
  }

  async markCurrentPoint() {
    const point = await this.currentPoint()
    if (!point) {
      return
    }
    const ordinal = this.nextOrdinal()
    this.args.remember({ marker: 'point', ordinal, point })
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
      if (unitsOfUser) {
        const valueInUsersUnits = await quantityInMeters(minimumValueInDroneUnits, unitsOfUser )
        const evaluated = await e(valueInUsersUnits)
        say(`The drone cannot go that slow. The minimum speed is ${await gr(evaluated.evalue)}`)
      } else {
        say(`The drone cannot go that fast. The minimum speed is ${await gr(minimumValueInDroneUnits)}`)
      }
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
      if (unitsOfUser) {
        const valueInUsersUnits = await quantityInMeters(maximumValueInDroneUnits, unitsOfUser)
        const evaluated = await e(valueInUsersUnits)
        say(`The drone cannot go that fast. The maximum speed is ${await gr(evaluated.evalue)}`)
      } else {
        say(`The drone cannot go that fast. The maximum speed is ${await gr(maximumValueInDroneUnits)}`)
      }
      objects.runCommand = false
      objects.current.speed = minimumSpeed
      return
    }

    const stopAtDistance = async (direction, distanceMeters) => {
      const speed_meters_per_second = objects.current.speed
      objects.current.durationInSeconds = distanceMeters / speed_meters_per_second
      await this.pause(objects.current.durationInSeconds, { batched: true })
      await this.stop({ batched: true })
      await this.markCurrentPoint()
    }

    if (objects.current.path.length > 0) {
      let currentPoint = (await this.args.recall({ context: { marker: 'point' } })).point
      this._objects.history.push({ marker: 'history', debug: 'doing path' })
      for (const [pathIndex, pathComponent] of objects.current.path.entries()) {
        if (pathComponent.repeatStart) {
          if (objects.current.timeRepeats) {
            this.startRepeats(objects.current.timeRepeats)
          }
        } else if (pathComponent.marker == 'pause') {
          this.pause(pathComponent.pauseSeconds, { batched: true })
        } else {
          const points = this.args.toArray(pathComponent)
          // const destinationPoint = pathComponent.point
          const destinationPoint = points[0].point || points[0]
          if (currentPoint.x == destinationPoint.x && currentPoint.y == destinationPoint.y) {
            // already there
          } else {
            const polar = cartesianToPolar(currentPoint, destinationPoint)
            const destinationAngleInRadians = polar.angle
            // const angleDelta = (destinationAngleInRadians - objects.current.angleInRadians)
            const angleDelta = rotateDelta(objects.current.angleInRadians, destinationAngleInRadians)
            await this.rotate(angleDelta, { batched: true })
            if (!pathComponent.aimOnly) {
              await this.forward(objects.current.speed, { batched: true })
              await stopAtDistance("forward", polar.radius)
              currentPoint = destinationPoint
            }
          }
        }
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

  async back(points) {
    const objects = this._objects
    let ordinal
    if (points?.quantity?.value) {
      ordinal = this.currentOrdinal() - points.quantity?.value
    } else {
      ordinal = this.currentOrdinal() - 1
    }
    const lastPoint = await this.args.recall({ context: { marker: 'point' }, condition: (context) => context.ordinal == ordinal })
    if (!lastPoint) {
      this.args.say(`There is no previous point to go back to`)
      return
    }
    objects.current.path.push(lastPoint)
    objects.runCommand = true
  }

  async backAndForth() {
    const objects = this._objects
    const current = objects.current
    current.backAndForth = true
    const ordinal = this.currentOrdinal()
    const currentPoint = await this.args.recall({ context: { marker: 'point' }, condition: (context) => context.ordinal == ordinal })
    const lastPoint = await this.args.recall({ context: { marker: 'point' }, condition: (context) => context.ordinal == ordinal-1 })
    current.path.push({ repeatStart: true })
    current.path.push(lastPoint)
    current.path.push(currentPoint)
    objects.runCommand = true
  }

  async sonic() {
    return await this.sonicDrone()
  }

  // TODO allow saying turn while its moving and make that one moves so you can go back wiggly?
  async rotate(angleInRadians, options) {
    let shortestRotate = angleInRadians
    if (shortestRotate > Math.PI) {
      shortestRotate = shortestRotate - Math.PI*2
    } else if (shortestRotate < -Math.PI) {
      shortestRotate = shortestRotate + Math.PI*2
    }
    await this.rotateDrone(angleInRadians, options)
    this._objects.current.angleInRadians = smallestRotate(this._objects.current.angleInRadians + angleInRadians)
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
    this._objects.history.push({ marker: 'history', pause: durationInSeconds, time: this.now(true, durationInSeconds*1000), ...options })
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

  now(lookahead = false, pause = 1000) {
    if (this.args.isProcess || this.args.isTest) {
      if (!this.testDate) {
        this.testDate = new Date(2025, 5, 29, 14, 52, 0)
      }
      if (lookahead) {
        return new Date(this.testDate.getTime() + pause)
      } else {
        this.testDate = new Date(this.testDate.getTime() + pause)
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
    "quantity in seconds",
    "quantity in meters per second",
    "number meters per second",
    "quantity in units",
    "number radians",
    "40 degrees in radians",
    "path",
    "forward",
  ],
  configs: [
    "arm, claw and drone are concepts",
    //TODO "forward left, right, backward are directions",
    "around, forward, left, right, back, forth and backward are directions",
    "paths are nameable and memorable",
    "start and end are properties of path",
    ({apis}) => {
      apis('properties').addHierarchyWatcher({
        match: ({childId}) => childId == 'point',
        apply: ({config, childId}) => {
          config.updateBridge(childId, ({ bridge }) => {
            if (!bridge.init) {
              bridge.init = {}
            }
            bridge.init['notConjunctableWith'] = ['quantity']
          })
        }
      })
    },

    "start and end are points",
    "rest and remaining are concepts",
    {
      hierarchy: [
        ['point', 'distributable'],
        ['thisitthat', 'path'],
        ['path', 'action'],
      ],
    },
    "speed and power are properties",
    "speed and power are comparable",
    "speed is a quantity",
    "point is a concept",
    // TODO fix/add this "position means point",
    "points are nameable orderable countable and memorable",
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
        // "([do] (path))",
        "([patrol] (path))",
        "([lift|lift,raise] (@<= arm || @<= claw))",
        "([lower] (@<= arm || @<=claw))",
        "([open] (claw))",
        "([close] (claw))",
        "([pathComponent])",
        "(<another> (point))",
        // "([turn] (direction))",
        // "([pause] ([number]))",
        "([stop] ([drone|])?)",
        "([toPoint|to] (point))",
        "([atPoint|at] (point))",
        // "([forRest|for] (rest/* || remaining/*))",
        "((context.unit.dimension == 'time') [timeAtPoint|] (atPoint))",
        // "((context.unit.dimension == 'time') [timeForRest|] (forRest))",
      ],
      bridges: [
        /*
        { 
          id: 'forRest',
          isA: ['preposition'],
          bridge: "{ ...next(operator), rest: after[0], operator: operator, interpolate: [{ property: 'operator' }, { property: 'rest' }] }"
        },
        { 
          id: 'timeForRest',
          before: ['verb'],
          after: ['preposition'],
          convolution: true,
          bridge: "{ ...next(operator), time: before[0], point: after[0], operator: operator, interpolate: [{ property: 'time' }, { property: 'point' }] }"
        },
        */
        { 
          id: 'timeAtPoint',
          before: ['verb'],
          after: ['preposition'],
          convolution: true,
          bridge: "{ ...next(operator), time: before[0], point: after[0], operator: operator, interpolate: [{ property: 'time' }, { property: 'point' }] }",
          check: defaultContextCheckProperties(['time', 'point']),
        },
        { 
          id: 'atPoint',
          isA: ['preposition'],
          bridge: "{ ...next(operator), point: after[0], operator: operator, interpolate: [{ property: 'operator' }, { property: 'point' }] }"
        },
        { 
          id: 'another',
          bridge: `{
            ...next(after[0]),
            another: operator,
            after: after[0],
            interpolate: [ { property: 'another' }, { property: 'after' } ]
          }`,
        },
        { 
          id: 'pathComponent',
          children: ['point', 'pause'],
        },
        {
          id: 'patrol',
          isA: ['verb', 'repeatable'],
          bridge: `{
            ...next(operator), operator: operator, path: after[0], interpolate: append(default(operator.interpolate, [{ property: 'operator'}]), [{ property: 'path' }])
          }`,
          semantic: async ({context, e, toArray, fragments, toEValue, toFinalValue, recall, objects}) => {
            const evaluated = await(e(context.path))
            const path = toEValue(evaluated)
          
            // TODO put this in a common place for use by do+patrol 

            // ordinal to pause time in seconds 
            const pauseTimeInSeconds = {}
            if (context.pause) {
              const timeAtPoints = toArray(context.pause.timeAtPoint)
              for (const timeAtPoint of timeAtPoints) {
                const instantiation = await fragments("quantity in seconds", { quantity: timeAtPoint.time })
                const result = await e(instantiation)
                const seconds = toFinalValue(toFinalValue(result).amount)

                const points = await recall({ context: timeAtPoint.point.point, frameOfReference: path })
                for (const point of toArray(points)) {
                  pauseTimeInSeconds[point.ordinal] = seconds
                }
              }
            }

            // get to the start of the patrol  
            objects.current.path.push(path.points[0])
            objects.current.path.push({ aimOnly: true, ...path.points[1] })
            objects.current.path.push({ repeatStart: true })
            for (const point of path.points) {
              objects.current.path.push(point)
              if (pauseTimeInSeconds[point.ordinal]) {
                objects.current.path.push({ marker: 'pause', pauseSeconds: pauseTimeInSeconds[point.ordinal] })
              }
            }
            if (context.repeats) {
              objects.current.timeRepeats = toFinalValue(context.repeats.repeats)
            }
            // if the patrol does not start and end at the same spot then 
            // go back to the start along the same path


            // if the start is not the end of the patrol then go backwards along the patrol
            if (JSON.stringify(path.points[0].point) !== JSON.stringify(path.points[path.points.length-1].point)) {
              for (const point of [...path.points].reverse().slice(1)) {
                objects.current.path.push(point)
                if (pauseTimeInSeconds[point.ordinal]) {
                  objects.current.path.push({ marker: 'pause', pauseSeconds: pauseTimeInSeconds[point.ordinal] })
                }
              }

              const secondPoint = path.points[1]
              objects.current.path.push({ ...secondPoint, aimOnly: true })
            }
            objects.runCommand = true
          }
        },
        /*
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
        */
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
          id: 'back',
          isA: ['noun'],
          semantic: async ({objects, api, e, context, say}) => {
            await api.back()
          }
        },
        {
          id: "forth",
          isA: ['noun'],
        },
        { 
          id: "toPoint",
          isA: ['preposition'],
          after: [['propertyOf', 1]],
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
          // convolution: true,
          isA: ['verb', 'action'],
          words: [
            ...conjugateVerb('go'),
          ],
          check: defaultContextCheckProperties(['direction', 'distance', 'to']),
          bridge: `{ 
            ...next(operator), 
            distance: distance?, 
            direction: direction?,
            points: points?,
            to: to?,
            operator: operator,
            interpolate: [{ property: 'operator' }, { property: 'direction' }, { property: 'points' }, { property: 'to' }, { property: 'distance' }] 
          }`,
          selector: {
            arguments: {
              distance: "(@<= 'quantity' && context.unit.dimension == 'length')",
              direction: "(@<= 'direction')",
              to: "(@<= 'toPoint')",
              points: "(@<= 'point')",
            },
          },
          semantic: async (args) => {
            const {context, objects, e, toArray, toEValue} = args
            if (context.distance) {
              await handleDistance(args, context.distance)
            }
            if (context.direction) {
              const array = toArray(context.direction)
              if (array.length == 2 && array[0].marker == 'back' && array[1].marker == 'forth') {
                await args.api.backAndForth()
              } else if (context.direction.marker == 'back') {
                await args.api.back(context.points)
              } else {
                objects.current.direction = context.direction.marker
              }
            }
            if (context.to) {
              const evaluation = await e(context.to.point)
              const point = toEValue(evaluation)
              objects.current.path.push(point)
            }
            objects.runCommand = true
          },
        },
        {
          id: 'turn',
          isA: ['verb', 'repeatable'],
          words: ['turn'],
          bridge: `{ 
            ...next(operator), 
            direction: direction, 
            operator: operator,
            angle: angle?,
            interpolate: append(default(operator.interpolate, [{ property: 'operator'}]), [{ property: 'direction' }, { property: 'angle' }])
          }
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
            async function toRadians(angle) {
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
          words: [
            ...conjugateVerb('pause'),
          ],
          bridge: "{ ...next(operator), timeAtPoint: timeAtPoint?, time: or(time?, forTime?), operator: operator, atPoint: atPoint?, interpolate: [{ property: 'operator' }, { property: 'time' }, { property: 'forTime' }, { property: 'atPoint' }, { property: 'timeAtPoint' } ] }",
          check: defaultContextCheckProperties(['timeAtPoint']),
          selector: {
            arguments: {
              forTime: "(@<= 'forQuantity' && context.quantity.unit.dimension == 'time')",
              time: "(@<= 'quantity' && context.unit.dimension == 'time')",
              atPoint: "(@<= 'atPoint')",
              timeAtPoint: "(@<= 'timeAtPoint')",
            },
          },
          semantic: async ({context, remember, api, e, fragments, toFinalValue}) => {
            let time = context.time 
            if (!time) {
              return
            }
            debugger
            if (time.marker == 'forQuantity') {
              time = time.quantity
            }
            const instantiation = await fragments("quantity in seconds", { quantity: time})
            const result = await e(instantiation)
            const seconds = toFinalValue(toFinalValue(result).amount)
            context.pauseSeconds = seconds
            remember(context)
            api.pause(seconds)
          }
        },
        {
          id: 'pause',
          level: 1,
          bridge: "{ ...repeatable, pause: operator, checks: append(repeatable.checks, ['pause']),  repeatable: repeatable, interpolate: [{ property: 'repeatable' }, { property: 'pause', byPosition: true }] }",
          selector: {
            loose: "repeatable",
            arguments: {
              repeatable: "(@<= 'repeatable')",
            },
          },
          check: defaultContextCheckProperties(['repeatable', 'repeats'])
        },
        {
          id: 'stop',
          isA: ['verb'],
          optional: {
            1: "{ marker: 'drone' }",
          },
          bridge: "{ ...next(operator), object: after[0], interpolate: [{ context: operator }, { property: 'object' }] }",
          semantic: async ({context, objects, api, say}) => {
            await api.stop()
            await api.markCurrentPoint()
          }
        },
      ],
      generators: [
        {
          match: ({context}) => context.marker == 'help' && !context.paraphrase && context.isResponse,
          apply: () => ''
        },
        {
          match: ({context}) => context.marker == 'point' && context.point,
          apply: ({context}) => `(${context.point.x.toFixed(2)}, ${context.point.y.toFixed(2)})`
        },
      ],
      semantics: [
        {
          match: ({context}) => context.marker == 'doAction',
          apply: async ({context, fragments, e, s, toEValue, toFinalValue, objects}) => {
            await s({ ...context, marker: 'patrol', path: context.action})
            if (false) {
              const evaluated = await(e(context.action))
              const path = toEValue(evaluated)
              let pauseTimeInSeconds = 0
              if (context.pause) {
                debugger
                const instantiation = await fragments("quantity in seconds", { quantity: context.pause.timeAtPoint.time })
                const result = await e(instantiation)
                const seconds = toFinalValue(toFinalValue(result).amount)
                pauseTimeInSeconds = seconds
              }
              for (const point of path.points) {
                objects.current.path.push(point)
                if (pauseTimeInSeconds) {
                  objects.current.path.push({ marker: 'pause', pauseSeconds: pauseTimeInSeconds })
                }
              }
              objects.runCommand = true
            }
          }
        },
        {
          match: ({context, contextHierarchy}) => {
            if (!context.pullFromContext || !context.evaluate || contextHierarchy.under(['doAction', 'evaluate', 'patrol']) || context.instance) {
              return false
            }
            
            if (context.marker == 'path' || context.marker == 'this' || context.marker == 'that') {
              return true
            }
          },
          apply: async ({context, frameOfReference, toArray, fragments, stm, objects, remember, recall, resolveEvaluate, _continue, contextHierarchy}) => {
            const pathComponents = toArray(await recall({ context: { marker: 'pathComponent' }, all: true }))
            const path = (await fragments('path')).contexts()[0]
            delete path.value
            path.instance = true
            path.points = pathComponents.reverse()
            frameOfReference(path, { mentioned: 'points', reversed: true })
            await remember(path)

            _continue() // let the call pick the object out from the stm
          },
        },
        {
          match: ({context, contextHierarchy}) => {
            if (!context.pullFromContext || !context.evaluate || !contextHierarchy.under('call') || context.notUnderCall) {
              return false
            }
            
            if (context.marker == 'point' || context.marker == 'ordinal') {
              return true
            }
          },
          apply: async ({frameOfReference, context, e, fragments, stm, toEValue, toArray, objects, remember, recall, resolveEvaluate, _continue, contextHierarchy}) => {
            const evaluated = await e({...context, notUnderCall: true})
            const pointsContext = toEValue(evaluated)
            const pathComponents = toArray(pointsContext)

            const path = (await fragments('path')).contexts()[0]
            delete path.value
            path.instance = true
            path.points = [...pathComponents]
            frameOfReference(path, { mentioned: 'points', reversed: true })
            await remember(path)
            resolveEvaluate(context, path)
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
          match: ({context}) => context.evaluate && ['start', 'end'].includes(context.marker) && context.objects && context.objects[1].marker == 'path',
          apply: async ({gp, s, context, objects, fragments, resolveEvaluate, api, recall}) => {
            const path = await recall({ context: context.objects[1] })
            if (!path?.points) {
              return
            }
            if (context.marker == 'start') {
              resolveEvaluate(context, path?.points[0])
            } else if (context.marker == 'end') {
              resolveEvaluate(context, path?.points[path?.points.length-1])
            }
          }
        },
        {
          match: ({context, contextHierarchy}) => 
              context.evaluate && 
              ['start', 'end', 'point'].includes(context.marker) && 
              !context.propertyOf && 
              contextHierarchy.under('go') &&
              !contextHierarchy.under('call'),
          apply: async ({gp, s, toArray, context, objects, fragments, resolveEvaluate, api, recall}) => {
            const path = await recall({ context: { marker: 'path' } })
            if (!path?.points) {
              return
            }
            
            if (context.marker == 'start') {
              resolveEvaluate(context, path?.points[0])
            } else if (context.marker == 'end') {
              resolveEvaluate(context, path?.points[path?.points.length-1])
            } else {
              const points = await recall({ context, frameOfReference: path })
              resolveEvaluate(context, toArray(points)[0])
            }
          }
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
            const fi = await fragments("number radians")
            const direction = await fi.instantiate([
              { 
                match: ({path, pathEquals}) => pathEquals(path, ['0', 'amount']),
                apply: ({context}) => {
                  Object.assign(context, { marker: 'number', value: value })
                }
              }
            ])
            const preferred = await s({ marker: 'preferredUnits', quantity: direction }) 
            const sss = await gp(direction)
            resolveEvaluate(context, preferred.response || direction)
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
          apply: async ({api}) => {
            await api.backAndForth()
          }
        }
      ],
    },
  ],
}

knowledgeModule( { 
  config: { name: 'drone' },
  includes: [actions, angle, compass, nameable, ordinals, hierarchy, rates, help],
  api: () => new API(),

  module,
  description: 'controlling a drone',
  test: {
    name: './drone.test.json',
    contents: drone_tests,
    checks: {
      context: [
        defaultContextCheck({ marker: 'path', exported: true, 
          extra: [
            'points', 
            'instance',
            { 
              property: 'namespaced', 
              check: [
                { property: 'stm', check: ['id'] },
                { property: 'nameable', check: ['names'] },
              ] 
            }
          ] 
        }),
        defaultContextCheck({ marker: 'point', exported: true, 
          extra: [
            'ordinal', 
            { property: 'point', check: ['x', 'y'] }, 
            'description', 
            { 
              property: 'namespaced', 
              check: [
                { property: 'stm', check: ['id'] },
                { property: 'nameable', check: ['names'] },
              ] 
            },
          ] 
        }),
        defaultContextCheck({ marker: 'turn', exported: true, extra: ['direction', 'repeats'] }),
        defaultContextCheck({ marker: 'history', exported: true, extra: ['debug', 'pause', 'direction', 'speed', 'turn', 'time', 'sonic', 'batched', 'repeats', 'armAction', 'clawAction'] }),
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
