const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const reminders_tests = require('./reminders.test.json')
const reminders_instance = require('./reminders.instance.json')
const selfKM = require('./self')
const dateTimeSelectors = require('./dateTimeSelectors')
const helpers = require('./helpers')

/*
   friday instead
   change it to friday
   delete it
   make it friday instead
   2 sundays from now
   the sunday after july 1st
*/

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

  async instantiate(reminder) {
    const value = await this.args.e(reminder.dateTimeSelector)
    reminder.nextISODate = value?.evalue
  }

  // the user of the KM can override this. this can be used to sync the GUI and the LUI
  getCurrent() {
  }

  askAbout() {
    const items = []
    for (const item of this._objects.reminders) {
      if (!item.dateTimeSelector) {
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
        "([remind] (self/*) (!@<= 'dateTimeSelector')*)",
        "([remind:withDateBridge] (self/*) (!@<= 'dateTimeSelector')* (dateTimeSelector))",
        "([remind:withDateAndTimeBridge] (self/*) (!@<= 'dateTimeSelector')* (dateTimeSelector) (atTime))",
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
          semantic: async ({api, gsp, gp, context}) => {
            const text = await gsp(context.reminder.slice(1));
            const reminder = { text, dateTimeSelector: context.date }
            if (context.date) {
              reminder.dateTimeSelector = context.date
              reminder.dateTimeSelectorText = await gp(context.date)
            }
            await api.instantiate(reminder)
            api.add(reminder)
          },
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
            if (isA(context.marker, 'onDateValue_dates') && api.askAbout().length > 0) {
                return true
            }
            return false
          },
          applyr: async ({ context, api, gp }) => {
            const items = api.askAbout()
            api.update({ id: items[0].id, dateTimeSelector: context, dateTimeSelectorText: await gp(context) })
          }
        },
      ])
    }
  ],
}

knowledgeModule( { 
  config: { name: 'reminders' },
  includes: [dateTimeSelectors, selfKM],
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
          filter: [ 
            'text', 
            'dateTimeSelectorText', 
            'nextISODate', 
            'stm',
            {
              property: 'dateTimeSelector', 
              filter: ['marker', 'text', 'value'],
            }
          ],
        }
      ],
    },
  },
  template: {
    template,
    instance: reminders_instance,
  },

})
