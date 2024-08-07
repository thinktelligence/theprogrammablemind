const { Config, knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const dialogues = require('./dialogues.js')
const pos = require('./pos.js')
const math = require('./math.js')
const hierarchy = require('./hierarchy.js')
const comparable = require('./comparable.js')
const countable = require('./countable.js')
const { API, getVariables, solveFor } = require('./helpers/formulas.js')
const tests = require('./formulas.test.json')
const instance = require('./formulas.instance.json')

/*
const template = {
  queries: [
    // { query: "x equals y + 4", development: true },
  ]
}
*/
/* TODO
  10 feet in inches  -> 1 foot equals 12 inches => 120 inches

  1 foot equals 12 inches
        foot = inches / 12    // remember expression or first one is remember
        inches = foot * 12    // expression

        10 feet in inches
        foot = 10             // value
        inches = ?            // value   search mentioned then memory -> search mentioned with evaluate if not then solve with memory

  f = i / 12
        f = i/12              // expression
        i = f*12              // expression

        f = 52                // value  -> forget after use? -> put in the mentioned?
        i = ??                // value

  y = mx + b  
        y is the slope
        ...

  f=1 f*f
      
  after calculating put the value in the mentioned STM 
  loops if ask for inches and foot not defined 
 
  pretend 1 foot equals 13 inches .... 
  y = 3 z = 4 x = y + z what is x               => 7
  z = 4 x = y + z what is x                     => y + 4
  z = a a = 3 x = z + a calculate x
  calculate x
  what is the formula for x
  what are the formulas
  what is the formula for meters in inches
  put the formalua in the mentioned. that starts acting like short term memory / use template "x is a formula" to put the formula in long term memory / add a phrase rememer that x equals ... / forget that x = ...
*/
/*
class API {
  initialize() {
    this.objects.formulas = {}
  }

  gets(name) {
    if (!this.objects.formulas[name.value]) {
      return []
    }
    if (this.objects.formulas[name.value].length == 0) {
      return []
    }
    return this.objects.formulas[name.value]
  }

  get(name) {
    return this.gets(name)[0]
  }

  // currently only supportings x = f(x) type formulas
  add(name, formula, equality) {
    if (!this.objects.formulas[name.value]) {
      this.objects.formulas[name.value] = []
    }
    this.objects.formulas[name.value].push({ name, formula, equality })
  }

  remove(name) {
    if (!this.objects.formulas[name.value]) {
      return
    }
    this.objects.formulas[name.value].pop()
  }
}
*/

let configStruct = {
  name: 'formulas',
  operators: [
    // TODO notations like (([arg1:]) [op] ([arg2:nameOfArg2}|word1])) -> just make the bridge + operators. put this in the bridge def / also calculate generators
    "([formula])",
    "([solve] (equals/1) ([forVariable|for]) (variable))",
    "(([formula]) [formulaForVariable|] ([forVariable|]) (variable))",
    "([calculate] ([expression]))",
    "(([expression]) [equals] ([expression]))",
  ],
  priorities: [
    { "context": [['mathematicalOperator', 0], ['number', 0], ], "choose": [0] },
  ],
  semantics: [
    {
      where: where(),
      match: ({context, api}) => context.evaluate && api.get(context),
      apply: ({context, api, e}) => {
        const { formula } = api.get(context)
        // console.log('greg24 -----------', JSON.stringify(formula, null, 2))
        context.evalue = e(formula) 
      }    
    },
  ],
  bridges: [
    {
      where: where(),
      id: 'formulaForVariable', 
      isA: ['preposition', 'queryable'],
      convolution: true,
      bridge: "{ number: before[0].number, ...next(operator), what: before[0], equality: after[0], variable: after[1] }",
      generatorp: ({context, g}) => `${g(context.what)} ${g(context.equality)} ${g(context.variable)}`,
      evaluator: ({context, api, objects}) => {
        const formulas = api.gets(context.variable).map((f) => { return { ...f.equality, paraphrase: true } })
        context.evalue = { marker: 'list', value: formulas }
      }
    },
    {
      where: where(),
      id: 'solve', 
      bridge: "{ ...next(operator), equality: after[0], variable: after[2] }",
      generatorp: ({context, gp}) => `${context.word} ${gp(context.equality)} for ${gp(context.variable)}`,
      semantic: ({context}) => {
        context.response = solveFor(context.equality, context.variable)
        context.isResponse = true
        context.value = null
        if (!context.response) {
          // TODO some KM for talking to the user wrt brief+avatar
          context.verbatim = `Solving failed`
        }
      }
    },
    { 
      id: 'forVariable',
      isA: ['preposition'],
    },
    { 
      id: 'formula',
    },
    {
      id: 'expression',
      children: ['mathematicalExpression', 'number'],
      before: ['verby'],
    },
    {
      where: where(),
      id: 'calculate',
      isA: ['verby'],
      bridge: "{ ...next(operator), expression: after[0] }",
      generatorp: ({context, g}) => `${context.word} ${g(context.expression)}`,
      localHierarchy: [ ['unknown', 'expression'] ],
      semantic: ({context, e}) => {
        context.evalue = e(context.expression)
        context.isResponse = true
      } 
    },
    {
      where: where(),
      id: 'equals',
      bridge: "{ ...next(operator), left: before[0], right: after[0] }",
      words: ['='],
      after: ['mathematicalOperator'],
      // TODO have this be per argument then 'is' can map to equals where this only applied to before[0] and not after[0]
      localHierarchy: [ ['unknown', 'expression'] ],
      generatorp: ({context, gp}) => `${gp(context.left)} ${context.word} ${gp(context.right)}`,
      semantic: ({context, api}) => {
        // TODO make sure left is a single name
        // TODO calculate invertable formulas?
        api.add(context.left, context.right, context)
      }
    },
  ]
};

const template = {
  queries: [
    "formulas are concepts",
    configStruct,
  ]
}

const createConfig = () => {
  const api = new API()
  config = new Config({ name: 'formulas' }, module)
  config.stop_auto_rebuild()
  config.add(dialogues(), pos(), math(), hierarchy(), comparable(), countable())
  config.api = api
  config.restart_auto_rebuild()
  return config
}

knowledgeModule({ 
  module,
  description: 'Formulas using math',
  createConfig,
  template: { template, instance },
  test: {
    name: './formulas.test.json',
    contents: tests,
    checks: {
      objects: ['formulas'],
      context: defaultContextCheck,
    }
  },
})
