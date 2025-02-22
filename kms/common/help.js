const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require('./dialogues')
const help_tests = require('./help.test.json')
const helpers = require('./helpers')

const getHelp = (config, indent=2) => {
  indent = ' '.repeat(indent)
  let help = ''
  if (config.tests.length == 0) {
    return ''
  }
  help += `${indent}NAME: ${config.name}\n`
  help += `${indent}DESCRIPTION: ${config.description}\n\n`
  help += `${indent}SAMPLE SENTENCES\n\n`
  for (const test of config.tests) {
    if (test.developerTest) {
      continue
    }
    help += `${indent}  ${test.query}\n`
  }
  return help
}

const config = {
  name: 'help',
  operators: [
    "([help] ([withKM|with] ([km]))?)",
    // "([help])",
    // help with <km>
    // sentence with the word blah
    // sentences with concept blah
  ],
  bridges: [
    { 
      id: "km", 
      level: 0, 
      bridge: "{ ...next(operator) }" 
    },
    { 
      where: where(),
      id: "help", 
      level: 0, 
      generatorp: () => 'help',
      generatorr: ({context, config}) => {
        const kms = helpers.propertyToArray(context.kms).map( (value) => value.value )
        const isAll = kms.length == 0
        let help = '';
        let separator = ''
        if (isAll || kms.includes(config.name)) {
          if (config.name !== 'tester') {
            help += getHelp(config)
            separator = '\n'
          }
        }
        
        if (config.configs.length > 1) {
          for (km of config.configs) {
            if (km._config instanceof Config) {
              if (isAll || kms.includes(km._config.name)) {
                help += separator + getHelp(km._config)
                separator = '\n'
              }
            }
          }
        }

        return help
      },
      optional: { 1: "{ marker: 'km', kms: []}" },
      bridge: "{ ...next(operator), kms: after[0].kms, isResponse: true }" 
    },
    { id: "withKM", level: 0, bridge: "{ ...next(operator), kms: after[0] }" },
  ],
  associations: {
    positive: [
      [['help', 0]],
    ]
  },
  debug: false,
  version: '3',
  words: {
    "literals": {
      // "km1": { "the": [{"id": "the", "initial": "{ modifiers: [] }" }],
      'km1': [{id: "km", initial: "{ value: 'km1', word: 'km1' }", development: true }],
    }
  },
};

const initializer = ({ config, addWord, kms }) => {
    const names = new Set()
    for (const name in kms) {
      names.add(name);
    }
    for (const name of names) {
      addWord(name, {id: "km", initial: `{ value: '${name}', word: '${name}' }`})
    }
  }

knowledgeModule({
  config,
  includes: [dialogues],
  initializer,

  module,
  description: 'Help the user with the current knowledge modules',
  test: {
    name: './help.test.json',
    contents: help_tests,
    checks: {
            context: defaultContextCheck(),
          },
  },
})
