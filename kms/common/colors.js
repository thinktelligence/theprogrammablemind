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
    // "resetIdSuffix",
  ],
}

const createConfig = () => {
  const config = new Config({ name: 'colors' }, module)
  config.add(hierarchy())
  return config
}

knowledgeModule( { 
  module,
  createConfig,
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
