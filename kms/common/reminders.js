const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const reminders_tests = require('./reminders.test.json')
const reminders_instance = require('./reminders.instance.json')
const selfKM = require('./self')
const dates = require('./dates')
const time = require('./time')
const reminders_helpers = require('./helpers/reminders')
const helpers = require('./helpers')

class API {
  initialize({ objects }) {
    this._objects = objects
    this._objects.reminders = []
    this._objects.id = 0
  }

  add(reminder) {
    const id = ++this._objects.id
    reminder.id = id
    this._objects.reminders.push(reminder)
    this.args.mentioned({ context: reminder })
  }

  instantiate(reminder) {
    let now;
    if (this.args.isProcess) {
      // so the unit tests work consistently
      now = new Date(2025, 6, 29, 14, 52, 0)
    } else {
      now = new Date()
    }
    reminder.nextISODate = reminders_helpers.instantiate(now, reminder)
  }

  // the user of the KM can override this. this can be used to sync the GUI and the LUI
  getCurrent() {
  }

  askAbout() {
    const items = []
    for (const item of this._objects.reminders) {
      if (!item.date) {
        items.push({ when: true, text: item.text, id: item.id })
      }
    }
    return items
  }

  show() {
    if (this._objects.reminders.length == 0) {
      return "There are no reminders"
    }
    let s = 'The reminders are\n'
    let counter = 1
    for (const item of this._objects.reminders) {
      s += `    ${counter}. ${item.text}\n`
      counter += 1
    }
    return s;
    // -> return a table object. then have ability to talk about the table. maybe later let's focus on this for now
  }

  delete_reminder(ordinal) {
    if (ordinal < 1 || ordinal > this._objects.reminders.length) {
      return `Not possible`
    }
    this._objects.reminders = this._objects.reminders.splice(ordinal, 1)
  }

  update(update) {
    for (const item of this._objects.reminders) {
      if (item.id == update.id) {
        Object.assign(item, update)
        return
      }
    }

  }
}

/*
  remind me to go to the store tuesday
*/
const template = {
  configs: [
    { 
      operators: [
        "([reminderTime|])",
        "([remind] (self/*) (!@<= 'onDate')*)",
        "([onDate|on] (reminderTime))",
        "([remind:withDateBridge] (self/*) (!@<= 'onDate')* (onDate))",
        "([remind:withDateAndTimeBridge] (self/*) (!@<= 'onDate')* (onDate) (atTime))",
        "([show] ([reminders]))",
        "([delete_reminders|delete,cancel] (number/*))",
      ],
      bridges: [
        {
          id: 'remind',
          isA: ['verb'],
          bridge: "{ ...next(operator), operator: operator, who: after[0], reminder: after[1], interpolate: '${operator} ${who} ${reminder}' }",
          withDateBridge: "{ ...next(operator), operator: operator, who: after[0], reminder: after[1], date: after[2], interpolate: '${operator} ${who} ${reminder} ${date}' }",
          withDateAndTimeBridge: "{ ...next(operator), operator: operator, who: after[0], reminder: after[1], date: after[2], time: after[3], interpolate: '${operator} ${who} ${reminder} ${date} ${time}' }",
          semantic: async ({api, gsp, context}) => {
            const text = await gsp(context.reminder.slice(1));
            const reminder = { text, date: context.date, time: context.time }
            api.instantiate(reminder)
            api.add(reminder)
          },
        },
        {
          id: 'reminderTime',
          children: [
            'day_dates',
            'month_dates',
          ],
        },
        { 
          id: 'onDate', 
          isA: ['preposition'],
          bridge: "{ ...next(operator), date: after[0], onDate: operator, interpolate: '${onDate} ${date}' }",
        },
        { 
          id: 'reminders', 
          isA: ['noun'],
        },
        {
          id: 'show',
          isA: ['verb'],
          bridge: "{ ...next(operator), operator: operator, reminders: after[0], interpolate: '${operator} ${reminders}' }",
          semantic: ({context, api, verbatim}) => {
            verbatim(api.show())
          }
        },
        {
          id: 'delete_reminders',
          isA: ['verb'],
          bridge: "{ ...next(operator), operator: operator, reminders: after[0], interpolate: '${operator} ${reminders}' }",
          semantic: ({context, api, verbatim}) => {
            const s = api.delete_reminder(context.reminders.value)
            if (s) {
              verbatim(s)
            }
          }
        },
      ]
    },
    ({ask, api}) => {
      ask([
        {
          where: where(),
          oneShot: false,
          onNevermind: ({verbatim, ...args}) => {
            // this is cross km boundaries from the dialogues km to this one so the api if for dialogs.
            // i need to get the one for fastfood here.
            const api = args.kms.fastfood.api
            const needsDrink = askAbout({ args, api })
            for (const item of needsDrink) {
              api.remove(item)
            }
          },

          matchq: ({ api, context }) => api.askAbout().length > 0 && context.marker == 'controlEnd',
          applyq: ({ api, context }) => {
            context.cascade = false
            const items = api.askAbout()
            const item = items[0]
            return 'When should I remind you to ' + item.text;
          },

          matchr: ({ isA, api, context }) => {
            if (isA(context.marker, 'reminderTime') && api.askAbout().length > 0) {
                return true
            }
            return false
          },
          applyr: ({ context, api }) => {
            const items = api.askAbout()
            api.update({ id: items[0].id, date: context })
          }
        },
      ])
    }
  ],
}

knowledgeModule( { 
  config: { name: 'reminders' },
  includes: [time, dates, selfKM],
  api: () => new API(),

  module,
  description: 'talking about reminders',
  test: {
    name: './reminders.test.json',
    contents: reminders_tests,
    checks: {
      context: defaultContextCheck(['who', 'reminder']),
      objects: [
        { 
          property: 'reminders',
          filter: [ 'text', 'date', 'time', 'nextISODate', 'stm' ],
        }
      ],
    },
  },
  template: {
    template,
    instance: reminders_instance,
  },

})
