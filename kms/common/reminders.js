const { knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const reminders_tests = require('./reminders.test.json')
const reminders_instance = require('./reminders.instance.json')
const dates = require('./dates')
const helpers = require('./helpers')

/*
  remind me to go to the store tuesday
*/
const template = {
  configs: [
    { 
      operators: [
        "([remind] )
      ],
    },
  ],
}

knowledgeModule( { 
  config: { name: 'reminders' },
  includes: [dates],

  module,
  description: 'talking about reminders',
  test: {
    name: './reminders.test.json',
    contents: reminders_tests,
    checks: {
      context: defaultContextCheck(['day', 'month', 'year', 'era']),
    },
  },
  template: {
    template,
    instance: reminders_instance,
  },

})
