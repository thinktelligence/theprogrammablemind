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
   remind every truck driver to whatever tomorrow at 8 am
*/

const query = (missing, reminder) => {
  return  {
    where: where(),
    // oneShot: false,
    onNevermind: ({verbatim, ...args}) => {
      const api = args.kms.reminders.api
      api.delete_reminder(reminder.id)
    },

    matchq: ({ api, context }) => api.missing(missing, reminder) && context.marker == 'controlEnd',
    applyq: async ({ api, context, gs }) => {
      context.cascade = false
      const item = api.missing(missing, reminder)
      let who
      if (Array.isArray(item.who)) {
        who = await gs(item.who.map((who) => who.text), ', ', ' and ')
      } else {
        if (item.who.text == 'me') {
          who = 'you'
        } else {
          who = item.who.text
        }
      }
      if (item.missingDate) {
        return `When should I remind ${who} to ${item.text}`
      }
      if (item.missingReminder) {
        return `What should I remind ${who} to do?`
      }
    },

    matchr: ({ isA, api, context }) => {
      const gotADate = ((isA(context.marker, 'onDateValue_dates') || isA(context.marker, 'dateTimeSelector')) && api.missing(missing, reminder))
      if (missing == 'missingDate') {
        return gotADate
      } else {
        // debugger
        // return !gotADate && !context.isControl
      }
      return false
    },
    applyr: async ({ context, api, gp }) => {
      const item = api.missing(missing, reminder)
      await api.update({ id: item.id, dateTimeSelector: context, dateTimeSelectorText: await gp(context) })
    }
  }
}

class API {
  initialize({ objects }) {
    this._objects = objects
    this._objects.reminders = []
    this._objects.id = 0
    this._objects.current = null
  }

  async add(reminder) {
    await this.instantiate(reminder)
    const id = ++this._objects.id
    reminder.id = id
    this._objects.reminders.push(reminder)
    this.args.mentioned({ context: reminder })
    this._objects.current = id
  }

  getCurrent() {
    return this._objects.current
  }

  // addUser to current
  addUser(user) {
    const reminder = this.reminders().find((r) => r.id == this._objects.current)
    if (reminder) {
      if (Array.isArray(reminder.who)) {
        reminder.who = [...reminder.who, user]
      } else {
        reminder.who = [reminder.who, user]
      }
    }
  }

  removeUser(user) {
    const reminder = this.reminders().find((r) => r.id == this._objects.current)
    if (reminder) {
      reminder.who = reminder.who.filter((who) => who.remindee_id != user.remindee_id)
    }
  }

  addRemindable(id, text) {
    if (!text) {
      text = id
    }
    this.args.makeObject({ ...this.args, context: { word: text, value: id, number: 'one', remindee_id: id }, initial: `remindee_id: "${id}"`, types: ['remindable'] })
  }

  async instantiate(reminder) {
    const value = await this.args.e(reminder.dateTimeSelector)
    reminder.nextISODate = value?.evalue
  }

  contextToWho(who) {
    if (who.isList) {
      const whos = []
      for (const element of this.args.values(who)) {
        whos.push(this.contextToWho(element))
      }
      return whos
    } else {
      return { id: who.value || who.text, text: who.text, remindee_id: who.remindee_id }
    }
  }

  // the user of the KM can override this. this can be used to sync the GUI and the LUI
  getCurrent() {
  }

  missing(what, reminder) {
    if (what == 'missingReminder' && !reminder.text) {
      return { when: true, who: reminder.who, text: reminder.text, id: reminder.id, missingReminder: true }
    }
    if (what == 'missingDate' && !reminder.dateTimeSelector) {
      return { when: true, who: reminder.who, text: reminder.text, id: reminder.id, missingDate: true }
    }
  }

  reminders() {
    return this._objects.reminders
  }

  setReminders(reminders) {
    this._objects.reminders = reminders
  }

  askAbout(what) {
    const items = []
    for (const item of this.reminders()) {
      if (this.missing('missingReminder', item)) {
        items.push(this.missing('missingReminder', item))
      }
      if (this.missing('missingDate', item)) {
        items.push(this.missing('missingDate', item))
      }
    }
    return items
  }

  show() {
    if (this.reminders().length == 0) {
      return "There are no reminders"
    }
    let s = 'The reminders are\n'
    let counter = 1
    for (const item of this.reminders()) {
      s += `    ${counter}. ${item.text}\n`
      counter += 1
    }
    return s;
    // -> return a table object. then have ability to talk about the table. maybe later let's focus on this for now
  }

  delete_reminder(id) {
    const reminder = this.reminders().find((reminder) => reminder.id)
    if (reminder) {
      if (reminder.cleanUp) {
        reminder.cleanUp()
      }
      this.setReminders(this._objects.reminders.filter((reminder) => reminder.id != id))
    }
  }

  async update(update) {
    for (const item of this._objects.reminders) {
      if (item.id == update.id) {
        Object.assign(item, update)
        await this.instantiate(item)
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
        "([remindable])",
        { pattern: "([addRemindable] (word)*)", development: true },
        "([remind:justWhoBridge] (remindable/*))",
        "([remind] (remindable/*) (!@<= 'dateTimeSelector' && !@<= 'inAddition')*)",
        "([remind:withDateBridge] (remindable/*) (!@<= 'dateTimeSelector' && !@<= 'inAddition')* (dateTimeSelector))",
        "([remind:withDateAndTimeBridge] (remindable/*) (!@<= 'dateTimeSelector' && !@<= 'inAddition')* (dateTimeSelector) (atTime))",
        "([show] ([reminders]))",
        "([delete_reminders|delete,cancel] (number/*))",
        "([add] (remindable/*))",
        "([remove|] (remindable/*))",
        "((verb/*) [inAddition|also,too])",
      ],
      bridges: [
        {
          id: 'inAddition',
          after: ['verb'],
          bridge: "{ ...before[0], inAddition: true, verb: before[0], operator: operator, interpolate: '${verb} ${operator}' }",
        },
        {
          id: 'add',
          isA: ['verb'],
          bridge: "{ ...next(operator), arg: after[0], operator: operator, interpolate: '${operator} ${arg}' }",
          semantic: ({api, context}) => {
            api.addUser(api.contextToWho(context.arg))
          }
        },
        {
          id: 'remove',
          words: ['delete', 'remove'],
          isA: ['verb'],
          bridge: "{ ...next(operator), arg: after[0], operator: operator, interpolate: '${operator} ${arg}' }",
          semantic: ({api, context}) => {
            api.removeUser(api.contextToWho(context.arg))
          }
        },
        {
          id: 'addRemindable',
          isA: ['verb'],
          development: true,
          bridge: "{ ...next(operator), flatten: true, arg: after[0], operator: operator, interpolate: '${operator} ${arg}' }",
          semantic: ({api, context}) => {
            const name = context.arg.map( (word) => word.text ).join(' ')
            api.addRemindable(name)
          }
        },
        {
          id: 'remindable',
          isA: ['listable'],
        },
        {
          id: 'remind',
          isA: ['verb'],
          localHierarchy: [['self', 'remindable']],
          bridge: "{ ...next(operator), operator: operator, who: after[0], reminder: after[1], interpolate: '${operator} ${who} ${reminder}' }",
          justWhoBridge: "{ ...next(operator), bridge: 'justWhoBridge', operator: operator, who: after[0], interpolate: '${operator} ${who}' }",
          withDateBridge: "{ ...next(operator), operator: operator, who: after[0], reminder: after[1], date: after[2], interpolate: '${operator} ${who} ${reminder} ${date}' }",
          withDateAndTimeBridge: "{ ...next(operator), operator: operator, who: after[0], reminder: after[1], date: after[2], time: after[3], interpolate: '${operator} ${who} ${reminder} ${date} ${time}' }",
          semantics: [
            {
              match: ({context}) => context.marker == 'remind' && context.inAddition,
              apply: ({context, api}) => {
                api.addUser(api.contextToWho(context.who))
              }
            },
          ],
          semantic: async ({ask, api, gsp, gp, context}) => {
            const who = api.contextToWho(context.who)
            let text;
            if (context.reminder) {
              text = await gsp(context.reminder.slice(1));
            }
            const reminder = { text, dateTimeSelector: context.date, who }
            if (context.date) {
              reminder.dateTimeSelector = context.date
              reminder.dateTimeSelectorText = await gp(context.date)
            }
            // await api.instantiate(reminder)
            await api.add(reminder)
            reminder.cleanUp = ask([
              query('missingReminder', reminder),
              query('missingDate', reminder),
            ])
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
    /*
    ({ask, api}) => {
      ask([
        query('missingReminder'),
        query('missingDate'),
      ])
    }
    */
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
      context: defaultContextCheck(['who', 'reminder', 'verbatim']),
      objects: [
        { 
          property: 'reminders',
          filter: [ 
            'text', 
            'dateTimeSelectorText', 
            'nextISODate', 
            'who', 
            'stm',
            {
              property: 'dateTimeSelector', 
              filter: ['marker', 'text', 'value'],
            },
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
