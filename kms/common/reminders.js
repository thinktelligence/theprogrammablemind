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
   add the user greg
   add greg as a user
*/

const query = (missing, reminder_id) => {
  return  {
    where: where(),
    // oneShot: false,
    onNevermind: ({verbatim, ...args}) => {
      const api = args.kms.reminders.api
      api.delete_reminder(reminder_id)
    },

    matchq: ({ api, context }) => api.missing(missing, reminder_id) && context.marker == 'controlEnd',
    applyq: async ({ api, context, gs, enable }) => {
      context.cascade = false
      const item = api.missing(missing, reminder_id)
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

      if (item.missingDate && item.missingReminder) {
        enable(['remindResponse', 0])
        enable(['remindResponseOnly', 0])
      } else if (item.missingReminder) {
        enable(['remindResponseOnly', 0])
      }

      /*
      if (item.missingDate && item.missingReminder) {
        enable(['remindResponse', 0])
      }
      */
      if (item.missingDate && missing == 'missingDate') {
        return `When should I remind ${who} to ${item.text}`
      }
      if (item.missingReminder && missing == 'missingReminder') {
        // enable(['remindResponse', 0])
        return `What should I remind ${who} to do?`
      }
    },

    matchr: async ({ isA, api, context }) => {
      if (context.evaluate || context.isControl || context.isResponse) {
        return false
      }
      const gotADate = ((isA(context.marker, 'onDateValue_dates') || isA(context.marker, 'dateTimeSelector')) && api.missing(missing, reminder_id))
      if (missing == 'missingDate') {
        return gotADate
      } else if (context.marker == 'remindResponseOnly' && missing == 'missingReminder') {
        return true
      }
      return false
    },
    applyr: async ({ context, api, gp, gsp }) => {
      if (context.marker == 'remindResponseOnly') {
        console.log(JSON.stringify(context, null, 2))
        let text;
        if (context.reminder) {
          text = await gsp(context.reminder.slice(0));
        }
        const item = api.missing(missing, reminder_id)
        await api.update({ id: item.id, text })
      } else {
        const item = api.missing(missing, reminder_id)
        await api.update({ id: item.id, dateTimeSelector: context, dateTimeSelectorText: await gp(context) })
      }
    }
  }
}

class API {
  initialize({ objects }) {
    this._objects = objects
    this._objects.reminders = []
    this._objects.id = 0
    this._objects.current = null
    this._objects.defaultTime = { hour: 9, minute: 0, second: 0, millisecond: 0 }
  }

  async add(reminder) {
    await this.instantiate(reminder)
    const id = ++this._objects.id
    reminder.id = id
    this._objects.reminders.push(reminder)
    this.args.mentioned({ context: reminder })
    this._objects.current = id
  }

  getCurrentId() {
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

  async addRemindable(id, text) {
    if (!text) {
      text = id
    }
    await this.args.makeObject({ ...this.args, context: { word: text, value: id, number: 'one', remindee_id: id }, initial: { remindee_id: `${id}` }, types: ['remindable'] })
  }

  async instantiate(reminder) {
    if (reminder.dateTimeSelector) {
      reminder.dateTimeSelector.defaultTime = this._objects.defaultTime
    }
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

  missing(what, reminder_id) {
    const reminder = this.reminder(reminder_id)
    if (what == 'missingReminder' && !reminder.text) {
      return { when: true, who: reminder.who, text: reminder.text, id: reminder.id, missingReminder: true, missingDate: !reminder.dateTimeSelector }
    }
    if (what == 'missingDate' && !reminder.dateTimeSelector) {
      return { when: true, who: reminder.who, text: reminder.text, id: reminder.id, missingDate: true, missingReminder: !reminder.missingReminder }
    }
  }

  reminder(id) {
    return this._objects.reminders.find((reminder) => reminder.id == id)
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
      if (this.missing('missingReminder', item.id)) {
        items.push(this.missing('missingReminder', item.id))
      }
      if (this.missing('missingDate', item.id)) {
        items.push(this.missing('missingDate', item.id))
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
      this.setReminders(this.reminders().filter((reminder) => reminder.id != id))
    }
  }

  async update(update) {
    if (!update.id) {
      update.id = this.getCurrentId()
    }
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
        "([remind:withDateFirstBridge] (remindable/*) (dateTimeSelector) (!@<= 'dateTimeSelector' && !@<= 'inAddition')*)",
        "([remind:withDateAndTimeBridge] (remindable/*) (!@<= 'dateTimeSelector' && !@<= 'inAddition')* (dateTimeSelector) (atTime))",

        "([remindResponse] (complete !== true && !@<= 'dateTimeSelector' && !@<= 'inAddition' )+ (dateTimeSelector))",
        "([remindResponseOnly] (context.complete != true && !@<= day_dates && !@<= 'dateTimeSelector' && !@<=remind)+)",

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
          bridge: "{ ...next(operator), complete: true, arg: after[0], operator: operator, interpolate: '${operator} ${arg}' }",
          semantic: ({api, context}) => {
            api.addUser(api.contextToWho(context.arg))
          }
        },
        {
          id: 'remove',
          words: ['delete', 'remove'],
          isA: ['verb'],
          bridge: "{ ...next(operator), complete: true, arg: after[0], operator: operator, interpolate: '${operator} ${arg}' }",
          semantic: ({api, context}) => {
            api.removeUser(api.contextToWho(context.arg))
          }
        },
        {
          id: 'addRemindable',
          isA: ['verb'],
          development: true,
          bridge: "{ ...next(operator), complete: true, flatten: true, arg: after[0], operator: operator, interpolate: '${operator} ${arg}' }",
          semantic: async ({api, context}) => {
            const name = context.arg.map( (word) => word.text ).join(' ')
            await api.addRemindable(name)
          }
        },
        {
          id: 'remindable',
          isA: ['listable'],
        },
        {
          id: 'remindResponseOnly',
          isA: ['verb'],
          convolution: true,
          disabled: true,
          bridge: "{ ...next(operator), complete: true, operator: operator, reminder: after[0], interpolate: '${reminder}' }",
          semantic: async ({context, api, gp, gsp}) => {
            const text = await gsp(context.reminder.slice(0));
            const update = { text }
            if (context.date) {
              update.dateTimeSelector = context.date
              update.dateTimeSelectorText = await gp(context.date)
            }
            await api.update(update)
          }
        },
        {
          id: 'remindResponse',
          before: ['remindResponseOnly'],
          isA: ['verb'],
          convolution: true,
          disabled: true,
          optional: {
            "2": { },
          },
          bridge: "{ ...next(operator), complete: true, operator: operator, reminder: after[0], date: after[1], interpolate: '${reminder} ${date}' }",
          semantic: async ({context, api, gp, gsp}) => {
            const text = await gsp(context.reminder.slice(0));
            const update = { text }
            if (context.date) {
              update.dateTimeSelector = context.date
              update.dateTimeSelectorText = await gp(context.date)
            }
            await api.update(update)
          }
        },
        {
          id: 'remind',
          isA: ['verb'],
          localHierarchy: [['self', 'remindable']],
          bridge: "{ ...next(operator), complete: true, operator: operator, who: after[0], reminder: after[1], interpolate: '${operator} ${who} ${reminder}' }",
          justWhoBridge: "{ ...next(operator), complete: true, bridge: 'justWhoBridge', operator: operator, who: after[0], interpolate: '${operator} ${who}' }",
          withDateBridge: "{ ...next(operator), complete: true, operator: operator, who: after[0], reminder: after[1], date: after[2], interpolate: '${operator} ${who} ${reminder} ${date}' }",
          withDateFirstBridge: "{ ...next(operator), complete: true, operator: operator, who: after[0], reminder: after[2], date: after[1], interpolate: '${operator} ${who} ${date} ${reminder}' }",
          withDateAndTimeBridge: "{ ...next(operator), complete: true, operator: operator, who: after[0], reminder: after[1], date: after[2], time: after[3], interpolate: '${operator} ${who} ${reminder} ${date} ${time}' }",
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
              query('missingReminder', reminder.id),
              query('missingDate', reminder.id),
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
          bridge: "{ ...next(operator), operator: operator, complete: true, reminders: after[0], interpolate: '${operator} ${reminders}' }",
          semantic: ({context, api, verbatim}) => {
            verbatim(api.show())
          }
        },
        {
          id: 'delete_reminders',
          isA: ['verb'],
          bridge: "{ ...next(operator), operator: operator, complete: true, reminders: after[0], interpolate: '${operator} ${reminders}' }",
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
      context: [defaultContextCheck({ extra: ['who', 'reminder'] })],
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
