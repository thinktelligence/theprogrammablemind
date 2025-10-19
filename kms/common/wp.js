const { knowledgeModule, where, Digraph } = require('./runtime').theprogrammablemind
const { defaultContextCheck } = require('./helpers')
const helpers = require("./helpers")
const ui = require("./ui")
const countable = require("./countable")
const colors = require("./colors")
const errors = require("./errors")
const wp_tests = require('./wp.test.json')
const instance = require('./wp.instance.json')

/*
  done

    bold the first word
    bold the first paragraph 
    bold the first letter
    bold the first word of every paragraph
    bold the first word of the second and third paragraph
    bold the paragraph that contains words that start with t
    underline the paragraph that contains bolded words
    underline the paragraphs that contain bolded words
    bold the first letter of every word
    bold the third letter of the second paragraph
    bold the first letter of every word that starts with t
    underline the bolded words in the second paragraph
    bold the words that start with t in the second paragraph
    bold the first letter of the words that start with t in the second paragraph
    in the second paragraph bold the first word
    in the second paragraph bold the first letter of the words that start with t
    underline the first bolded word
    underline the first three words
    in the first and second paragraph bold the second word
    underline the first three bolded words
    capitalize the first letter of the words that start with t

  current
 
    change is editable to is really editable 

  todo

    the first to fifth word
    underline the last three words
    for paragraph 1 and 2 bold the first word
    in the second paragraph for the words that start with t bold the first letter
    underline the bolded paragraphs
    bold the first three words after the second bolded letter
    underline the words that start with t in the paragraph with 3 bolded words
    underline the paragraph that contains three bolded words
    underline the first bolded word that start with t
    bold the first word of the second paragraph and third paragraph
    the paragraph that contains the word boobies

    after
    make the words that start with t blue

  the bolded words that start with t

  replace better with worse

  change underlines to bolds

  start inserting text until I say banana
  ...
  or 
  stop inserting text

  make the text of the 1st to 3rd paragraphs blue
  
  capitalize the words banana and word
  capitalize banana and tree

  make the words that start with a bold

  make every word bold and underlines and blue -> weirdly "bold underlined and blue" works

  make the font ... 
  make the color blue
  make the color of the first paragraph blue

  undeline the bolded text / the text that is bolded

  words that start with a
  make all the bold text uppercase
  underline all the bold text
  underline all the text
  underline everything
  4 letter word
  4 to 6 letter word
  word with 'a' in it
  words containing a
  every 5th word

  the words that are capitalized 

  in the first paragraph make the words that start with abc bold
  bold the first three words that start with t
  bold much and many
  make the words that start with t bold and underlined
  make all the capital letters|punctuation bold

  move this paragraph up 2
  move the next paragraph up 1
  move the last paragraph before this one
*/

class API {
  initialize({ objects }) {
    this._objects = objects
    this._objects.changeState = []
  }

  changeState(value) {
    this._objects.changeState.push(value)
  }
}

const root = (id) => {
  return id.split('_')[0]
}

const setUpdate = (isA, update, states) => {
  let color;
  const styles = []
  for (const state of states) {
    if (isA(state, 'style_wp')) {
      if (!update.styles) {
        update.styles = []
      }
      const style = root(state.value)
      /*
      if (style == 'underlined') {
        style = 'underline'
      } else if (style == 'italicize') {
        style = 'italic'
      }
      */
      update.styles.push(style)
    } else {
      update.color = root(state.value)
    }
  }
}

const config = {
  name: 'wp',
};

const changeState = ({api, isA, context, toArray, element, state}) => {
  let scope

  const getElement = (selector, update) => {
    const unit = root(selector.marker)
    const conditions = []
    let scope;
    const condition = []
    if (selector.ordinal) {
      // TODO think this out better but its just POC so good enough for now
      const condition = { ordinals: toArray(selector.ordinal).map((context) => context.value) }
      if (selector.quantity) {
        condition.count = selector.quantity.value
      }
      conditions.push(condition)
    } else if (isA(selector, 'everything')) {
      scope = 'all'
    } else if (selector.quantity) {
      scope = selector.quantity.quantity
    } if (selector.distributer) {
      scope = selector.distributer.value
    }

    if (selector.conditions) {
      for (const condition of selector.conditions) {
        if (condition.marker == 'wordComparisonWithVerb_wp') {
          // with or not with that is the question
          const letters = condition.letters.letters.text
          conditions.push({ comparison: condition.comparison, letters })
        } else if (condition.marker == 'wordComparison_wp') {
          // with or not with that is the question
          const letters = condition.letters.text
          conditions.push({ comparison: condition.comparison, letters })
        } else if (condition.marker == 'paragraphComparisonVerb_wp') {
          // with or not with that is the question
          const update = { selectors: [] }
          const words = getElement(condition.words, update)
          conditions.push({ comparison: condition.comparison, words: update})
        } else if (isA(condition, 'styleModifier_wp')) {
          for (const style of toArray(condition)) {
            conditions.push({ hasStyle: style.marker })
          }
        }
      }
    }

    if (selector.context) {
      for (const context of toArray(selector.context)) {
        getElement(context, update)
      }
    }

    update.selectors.push({ unit, scope, conditions })
  }

  const update = { selectors: [] }
  getElement(context.element, update)

  setUpdate(isA, update, toArray(context.state))
  api.changeState(update)
}

template = {
  configs: [
    'setidsuffix _wp',
    'words are countable distributable orderable textContainers and statefulElements',
    'characters are countable distributable orderable and statefulElements',
    'paragraphs are countable distributable orderable textContainers and statefulElement',
    'text is a statefulElement',
    'letters means characters',
    'bold, italic, code, capitalize, lowercase and underline are styles',
    'underlined means underline',
    'capitalized means capitalize',
    'uppercase means capitalize',
    'italicize means italic',
    'italicized means italic',
    // TODO have a mode where I can stay this is a definition sentence then just say style modifies and it will do it right
    'uppercased, lowercased, capitalized, bolded, italicized and underlined are styleModifiers',
    // 'start end and contain are wordComparisonWiths',
    // 'styles are negatable',
    "resetIdSuffix",
    {
      operators: [
        "([change_wp|change] (context.text !== 'to')* (context.text == 'to'))",
        "([changeState_wp|make] ([statefulElement_wp]) ([stateValue_wp|]))",
        "((style_wp/*) [applyStyle_wp] ([statefulElement_wp|]))",
        "((word_wp/*) [wordComparisonWithVerb_wp] ([comparisonWith_wp|with] (a/0)? (letters)))",
        "((word_wp/*) [wordComparison_wp] (a/0)? (letters))",
        // this one is "the bolded/underlined/italized/... word"
        "((styleModifier_wp/*) [modifiedByStyle_wp] (statefulElement_wp/* && context.determiner == undefined))",
        // the first letter of each paragraph 
        "((statefulElement_wp/*)? <statefulElementInContext_wp|of,in> (statefulElement_wp/*))",
        // the paragraph that contains words that start with t
        "((paragraph_wp/*) [paragraphComparisonVerb_wp] (word_wp/*))",
      ],
      associations: {
        positive: [
          { context: [["bold_wp", 0], ["the", 0], ["ordinal", 0], ["word_wp", 0], ["statefulElementInContext_wp", 0], ["the", 0], ["ordinal", 0], ["list", 0], ["ordinal", 0], ["paragraph_wp", 0]], choose: { index: 0, increment: true } },
          { context: [["bold_wp", 1], ["the", 0], ["ordinal", 0], ["word_wp", 0], ["statefulElementInContext_wp", 0], ["the", 0], ["ordinal", 0], ["list", 0], ["ordinal", 0], ["paragraph_wp", 0]], choose: { index: 0, increment: true } },
          { context: [["bold_wp", 1], ["the", 0], ["ordinal", 1], ["word_wp", 0], ["statefulElementInContext_wp", 0], ["the", 0], ["ordinal", 0], ["list", 0], ["ordinal", 0], ["paragraph_wp", 0]], choose: { index: 0, increment: true } },
          { context: [["bold_wp", 1], ["the", 0], ["ordinal", 1], ["word_wp", 1], ["statefulElementInContext_wp", 0], ["the", 0], ["ordinal", 0], ["list", 0], ["ordinal", 0], ["paragraph_wp", 0]], choose: { index: 0, increment: true } },

          { context: [["word_wp",1],["thatVerb",0],["wordComparison_wp",0],["unknown",0]], choose: 0 },
          { context: [["paragraph_wp",1],["thatVerb",0],["paragraphComparisonVerb_wp",0],["unknown",0]], choose: 0 },
          { context: [["word_wp",0],["thatVerb",0],["wordComparison_wp",0]], choose: 0 },
          { context: [["paragraph_wp",0],["thatVerb",0],["paragraphComparisonVerb_wp",0]], choose: 0 },
          { context: [["paragraph_wp",1],["thatVerb",0],["paragraphComparisonVerb_wp",0]], choose: 0 },
          { context: [["paragraph_wp",1],["thatVerb",0],["paragraphComparisonVerb_wp",0],["bolded_wp",0],["word_wp",0]], choose: 0 },
          { context: [["paragraph_wp",1],["thatVerb",0],["paragraphComparisonVerb_wp",0],["word_wp",0]], choose: 0 },
          { context: [["article",0],["word_wp",1],["statefulElementInContext_wp",0],["every", 0],["paragraph_wp",0]], choose: 1 },
          { context: [["article",0],["statefulElement_wp",0]], choose: 1 },
          { context: [["article",0],["statefulElement_wp",1]], choose: 1 },
          { context: [["article",0],["ordinal", 0],["statefulElement_wp",0]], choose: 2 },

          { context: [["styleModifier_wp",0],["statefulElement_wp",0]], choose: 1 },
        ]
      },

      bridges: [
        {
          id: 'change_wp',
          bridge: "{ ...next(operator), from: after[0][0], generate: [operator, 'from', after[1]] }",
        },
        { 
          id: 'paragraphComparisonVerb_wp',
          parents: ['verb'],
          words: [ 
            { word: 'contain', comparison: 'include' }, 
            { word: 'contains', comparison: 'include' },
            { word: 'include', comparison: 'include' }, 
            { word: 'includes', comparison: 'include' },
          ],
          bridge: "{ ...next(operator), element: before[0], subject: before[0], words: after[0], verb: operator, generate: ['element', 'verb', 'words'] }",
        },
        { 
          id: 'statefulElementInContext_wp',
          parents: ['preposition'],
          optional: {
            '-1': "{ ...operator, invisible: true }",
          },
          bridge: "{ ...next(before[0]), context: append(before[0].context, [after[0]]), generate: [before[0], operator, after[0]], modifiers: [] }",
          semantic: (args) => {
            const { context, contexts } = args
            for (let i = context.context_index + 1; i < contexts.length; ++i) {
              if (contexts[i].marker == 'applyStyle_wp') {
                const element = contexts[i].element
                if (!element.context) {
                  element.context = []
                }
                element.context = element.context.concat(context.context)
              }
            }
            console.log(JSON.stringify(Object.keys(args)))
          },
        },
        { 
          id: 'applyStyle_wp',
          parents: ['verb'],
          convolution: true,
          bridge: "{ ...next(operator), element: after[0], state: before[0], operator: operator, generate: ['state', 'element'] }",
          localHierarchy: [
            ['thisitthat', 'statefulElement_wp'],
            ['everything', 'statefulElement_wp'],
          ],
          semantic: (args) => {
            changeState({...args, element: args.context.element, state: args.context.state})
          }
        },
        { 
          id: 'modifiedByStyle_wp',
          // parents: ['verb'],
          parents: ['adjective'],
          convolution: true,
          bridge: "{ ...after[0], style: before[0], target: after[0], generate: ['style', 'target'], conditions: append(after[0].conditions, [before[0]]) }",
        },
        { 
          id: 'wordComparisonWithVerb_wp',
          parents: ['verb'],
          words: [ 
            { word: 'start', comparison: 'prefix' }, 
            { word: 'starts', comparison: 'prefix', },
            { word: 'end', comparison: 'suffix' },
            { word: 'ends', comparison: 'suffix' },
          ],
          bridge: "{ ...next(operator), element: before[0], subject: before[0], letters: after[0], verb: operator, generate: ['element', 'verb', 'letters'] }",
        },
        { 
          id: 'wordComparison_wp',
          parents: ['verb'],
          words: [ 
            { word: 'contain', comparison: 'include' }, 
            { word: 'contains', comparison: 'include' },
            { word: 'include', comparison: 'include' }, 
            { word: 'includes', comparison: 'include' },
          ],
          optional: {
            1: "{ marker: 'a' }",
          },
          bridge: "{ ...next(operator), element: before[0], subject: before[0], letters: after[1], verb: operator, generate: ['element', 'verb', 'letters'] }",
        },
        { 
          id: 'comparisonWith_wp',
          parents: ['preposition'],
          optional: {
            1: "{ marker: 'a' }",
          },
          bridge: "{ ...next(operator), operator: operator, letters: after[1], generate: ['operator', 'letters'] }",
        },
        { 
          id: 'changeState_wp',
          parents: ['verb'],
          bridge: "{ ...next(operator), element: after[0], state: after[1], operator: operator, generate: ['operator', 'element', 'state'] }",
          localHierarchy: [
            ['thisitthat', 'statefulElement_wp'],
            ['everything', 'statefulElement_wp'],
          ],
          semantic: (args) => {
            changeState({...args, element: args.context.element, state: args.context.state})
          }
        },
        { 
          id: 'stateValue_wp',
          children: ['color_colors', 'style_wp'],
        },
      ],
      semantics: [
        {
          where: where(),
          match: ({context, isA}) => isA(context, 'style_wp') && !context.same && !context.isResponse && !context.evaluate,
          apply: ({context, api, isA, toArray}) => {
            const update = { scope: 'selection' }
            setUpdate(isA, update, toArray(context))
            api.changeState(update)
          }
        },
        {
          where: where(),
          match: ({context, isA}) => isA(context, 'statefulElement_wp') && !context.same && !context.isResponse && !context.evaluate,
          apply: ({context, api, isA, toArray}) => {
            const unit = root(context.marker)
            let scope
            if (context.quantity) {
              scope = context.quantity.quantity
            }
            // TODO set default scope for "every word bold underlined etc"
          }
        },
      ],
      priorities: [
        { "context": [['ordinal', 1], ['list', 0], ['ordinal', 1], ['statefulElement_wp', 0]], ordered: true, choose: [1] },
        { "context": [['word_wp', 1], ['wordComparisonWithVerb_wp', 0], ['comparisonWith_wp', 1], ['statefulElementInContext_wp', 0]], ordered: true, choose: [1] },
        { "context": [['paragraphComparisonVerb_wp', 0], ['word_wp', 0], ['wordComparisonWithVerb_wp', 0]], ordered: true, choose: [2] },
        { "context": [['statefulElementInContext_wp', 0], ['word_wp', 0], ['wordComparisonWithVerb_wp', 0]], ordered: true, choose: [2] },
        { "context": [['statefulElementInContext_wp', 0], ['word_wp', 1], ['wordComparisonWithVerb_wp', 0], ['comparisonWith_wp', 1]], ordered: true, choose: [2,3] },
        { "context": [['statefulElementInContext_wp', 0], ['comparisonWith_wp', 0]], choose: [1] },
        { "context": [['paragraphComparisonVerb_wp', 0], ['wordComparisonWithVerb_wp', 0]], choose: [1] },
        { "context": [['ordinal',1], ['list', 0], ['ordinal', 1], ['word_wp', 1]], ordered: true, choose: [1] },
        { "context": [['changeState_wp',0], ['every', 0], ['word_wp', 1], ['list', 1]], ordered: true, choose: [1] },
        { "context": [['changeState_wp',0], ['statefulElement_wp', 0], ['list', 0]], ordered: true, choose: [0] },
        { "context": [['comparisonWith_wp',0], ['unknown', 0], ['list', 1]], ordered: true, choose: [0] },
      ],
    },
    // "([changeState_wp|make] ([statefulElement_wp]) ([stateValue_wp|]))",
    // "((style_wp/*) [applyStyle_wp] ([statefulElement_wp|]))",
    // "x statefulElement_wp y means y changeState_wp x",
  ]
}

knowledgeModule({ 
  config,
  includes: [ui, countable, colors, errors],
  api: () => new API(),

  module,
  description: 'Word processor',
  test: {
    name: './wp.test.json',
    contents: wp_tests,
    checks: {
      context: [defaultContextCheck({ extra: ['distributer', 'subject', 'element', 'letters', 'target', 'conditions' ] })], 
      objects: [
        'changeState', 
        { km: 'ui' },
      ],
    },
  },
  template: {
    template,
    instance,
  }
})
