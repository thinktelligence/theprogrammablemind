const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const colors_tests = require('./colors.test.json')
const colors_instance = require('./colors.instance.json')
const hierarchy = require('./hierarchy')

const template = {
  configs: [
    "setidsuffix _colors",
    "dark and light are brightness",
    "red, pink, orange, yellow, purple, green, blue, brown, white and gray are colors",
    "crimson is a red",
    "gold and khaki is a yellow",
    "lavender, violet, magenta and indigo is a purple",
    "lime, chartruese, olive and teal are a green",
    "aqua, cyan, aquamarine, turquoise and navy are a blue",
    "tan, sienna and maroon are a brown",
    "snow, azure, beige and ivory are a white",
    "silver and black are a gray",
    "brightness modifies colors",
    "hex modifies color",
    // '"hex color" is a color',
    {
      /*
        operators: [
          "([hexColor|])",
        ],
        bridges: [
          { 
            id: 'hexColor',
            words: ['hex color'],
          },
        ],
      */
      words: {
        patterns: [
          { "pattern": ["#", { type: 'hexDigit' }, { repeat: true, exactly: 6 }], defs: [{id: "hexColor", uuid: '1', initial: "{ value: text, instance: true }" }]},
        ],
        hierarchy: [
          ..."0123456789abcdefABCDEF".split("").map((digit) => { return { child: digit, parent: 'hexDigit' } })
        ],
      }
    },
    // "hex color is a color",
    "resetIdSuffix",
  ],
}

knowledgeModule( { 
  config: { name: 'colors' },
  includes: [hierarchy],

  module,
  description: 'talking about colors',
  test: {
    name: './colors.test.json',
    contents: colors_tests,
    checks: {
      context: defaultContextCheck,
    },
  },
  template: {
    template,
    instance: colors_instance,
  },

})
