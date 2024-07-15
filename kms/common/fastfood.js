const { Config, knowledgeModule, ensureTestFile, where } = require('./runtime').theprogrammablemind
const { defaultContextCheck, propertyToArray } = require('./helpers')
const edible = require('./edible')
const events = require('./events')
const sizeable = require('./sizeable')
const countable = require('./countable')
const { isMany, getCount } = require('./helpers')
ensureTestFile(module, 'fastfood', 'test')
ensureTestFile(module, 'fastfood', 'instance')

const fastfood_tests = require('./fastfood.test.json')
const fastfood_instance = require('./fastfood.instance.json')

/*
  hello -> to order
  can I help you? -> expect order
    a big mac and large fries with a large coke
  gimme a big mac and large fries with a large coke
  make them large
  no small instead
  give me a combo one / give me a single combo / i want combo one
  i want 2 hamburgers -> what kind?
    big mac
    big mac quarter pounder

  single and double combo
  single combo
  combo one and two

  double hamburger
  number 1 and 2
  number 1 2 and 3
*/

const template = {
  "queries": [
    "food is countable",
    "drinks are countable",
    "bacon modifies deluxe",
    { priorities: [ { "context": [['bacon_deluxe', 0], ['list', 0]], "choose": [0] } ] },
    "chicken modifies sandwich",
    { priorities: [ { "context": [['chicken_sandwich', 0], ['list', 0]], "choose": [0] } ] },
    "premium modifies cod",
    { priorities: [ { "context": [['premium_cod', 0], ['list', 0]], "choose": [0] } ] },
    "ultimate chicken modifies grill",
    { priorities: [ { "context": [['ultimate_chicken_grill', 0], ['list', 0]], "choose": [0] } ] },
    // "10 piece modifies nuggets",
    "chicken modifies club",
    "asiago ranch modifies chicken club",
    "crispy modifies chicken",
    "crispy chicken modifies club",
    "club is a sandwich",
    { priorities: [ { "context": [['asiago_ranch_chicken_club', 0], ['list', 0]], "choose": [0] } ] },
    "waffle modifies fries",
    { priorities: [ { "context": [['waffle_fry', 0], ['list', 0]], "choose": [0] } ] },
    "loaded modifies fries",
    "chili modifies fries",
    "garden modifies salad",
    "caesar modifies salad",
    "cheese modifies potato",
    "waffle fries are french fries",
    "mango modifies passion",
    "wild modifies berry",
    "strawberry modifies banana",
    "strawberry, guava, mango passion, wild berry and strawberry banana modify smoothie",
    "strawberry, guava, mango passion, wild berry, and strawberry banana are countable",
    "smoothie modifies ingredients",
    "strawberry, guava, mango passion, wild berry, and strawberry banana are smoothie ingredients",
    // { stop: true },
    "a smoothie is a drink",
    "french fries and waffle fries are fries",
    "single, double, triple, baconator, and bacon deluxe are hamburgers",
    // "spicy homestyle asiago ranch chicken club 10 piece nuggets ultimate chicken grill and premium cod are sandwiches",
    "spicy, homestyle, asiago ranch chicken club, ultimate chicken grill and premium cod are sandwiches",
    "meals are food",
    "a combo is a meal",
    "chili is a meal",
    "a shake is a drink",
    "vanilla modifies shake",
    "mango passion modifies shake",
    "strawberry modifies shake",
    "guava modifies shake",
    "chocolate modifies shake",
    "banana modifies shake",
    "wild berry modifies shake",
    "frosty is a drink",
    "vanilla modifies frosty",
    "chocolate modifies frosty",
    "breakfast modifies baconator",
    "french toast modifies sandwich",
    "egg modifies muffin",
    "chicken on modifies french toast",
    "pancake modifies platter",
    "double sausage modifies muffin",
    "apple pecan modifies salad",
    "spicy modifies caesar salad",
    "taco modifies salad",
    "southwest avacado modifies salad",
    "breakfast modifies meals",
    "bacon modifies cheeseburger",
    "junior modifies bacon cheeseburger",
    "go modifies wrap",
    "a go wrap is a sandwich",
    "chicken modifies go wrap",
    "breakfast baconator, french toast sandwich, egg muffin, chicken on french toast, pancake platter, double sausage muffin, pancakes, french toast and oatmeal are breakfast meals",
    "single, double, triple, baconator, bacon deluxe, spicy homestyle and premium cod are meals",
    "coca modifies cola",
    "diet modifies coke",
    "iced modifies tea",
    "coke, coca cola, diet coke, sprite, fanta, barqs and iced tea are pop",
    "sweet black modifies coffee",
    "french vanilla modifies coffee",
    "cappuccino modifies coffee",
    "mocha modifies shake",
    "caramel modifies shake",
    "strawberry modifies lemonade",
    "wild berry modifies lemonade",
    "plain modifies lemonade",
    "fries and drinks are modifications",
    // TODO Future see above note { query: "(combo one) and (2 combo twos)", skipSemantics: true },
    // { query: "(2 mango passion and (3 strawberry)) smoothies", skipSemantics: true },
    { query: "(2 mango passion and (3 strawberry)) smoothies", skipSemantics: true },
    "broccoli and cheddar literally modifies potato",
    "bacon and cheddar literally modifies potato",
    "chili and cheese literally modifies potato",
    "kids modifies meal",
    "value modifies meal",
    "bottled modifies water",
    "bottled water is a drink",
    "apple modifies slice",
    "natural cut modifies fries",
    "hamburgers, cheeseburgers, crispy chicken and nuggets are kids meals",
    {
      where: where(),
      operators: [
        "((meal/* && context.comboNumber == undefined) [comboMeal] (combo/*))",
        "((combo/*) [comboNumber] (number/* || numberNumberCombo/*))",
        "((numberNumberCombo/1) [numberNumberCombo_combo|] (combo/0))",
        "((number/0,1 && context.instance == undefined) [numberNumberCombo] (number/0,1))",
        "((combo/*) [([withModification|with] ([modification]))])",
      ],
      floaters: ['instance'],
      priorities: [
       // { "context": [['counting', 0], ['strawberry_smoothie', 0], ], "choose": [0] },
       { "context": [['cheese_potato', 0], ['broccoli_list_cheddar_potato', 0]], "choose": [1] },
       { "context": [['chicken_go_wrap', 0], ['chicken_sandwich', 0], ], "choose": [0] },
       { "context": [['strawberry_banana', 0], ['smoothie', 0], ], "choose": [0] },
       { "context": [['number', 0], ['numberNumberCombo', 0], ], "choose": [0] },
       { "context": [['list', 0], ['numberNumberCombo', 0], ], "choose": [0] },

       // TODO take this out make the server side learn if from "(combo one) and (two combo twos)" .   (prioritized1) 'and' (prioritized2) where 1+2 came from and build the cp that way
       { "context": [['combo',0], ['number', 0], ['list', 0], ['number', 0],['combo', 0],['number',0]], ordered: true, choose: [0,1,3,4,5] },
       { "context": [['number',0], ['smoothie_ingredient', 0], ['list', 0], ['number', 0],['smoothie_ingredient', 0],['smoothie',0]], ordered: true, choose: [0,1,3,4] },
       // { "context": [['single',0], ['list', 0], ['double', 0],['combo', 0]], ordered: true, choose: [0,1,2] },
       // { "context": [['list', 0], ['comboMeal', 0]], choose: [0] },
       { "context": [['list', 0], ['smoothie', 0]], choose: [0] },
       { "context": [['list', 0], ['smoothie', 1]], choose: [0] },

       { "context": [['smoothie_ingredient', 1], ['list', 0], ['number', 1], ['smoothie_ingredient', 1], ['smoothie', 1]], ordered: true, choose: [2,3] },
       { "context": [['smoothie_ingredient', 1], ['list', 0], ['smoothie_ingredient', 1], ['smoothie', 1]], ordered: true, choose: [1] },

       { "context": [['list', 0], ['number', 1], ['combo', 1], ['number', 1]], ordered: true, choose: [2,3] },
       { "context": [['withModification', 0], ['modification', 1], ['list', 0], ['modification', 1]], ordered: true, choose: [2] },


       { context: [['comboNumber', 0], ['counting',0]], choose: [0] },
       // { context: [['counting', 0], ['smoothie',0]], choose: [0] },
       { context: [['list', 0], ['food',0], ['combo', 0]], ordered: true, choose: [0,1] },
       { context: [['combo', 0], ['number', 0], ['list',0], ['number', 0]], ordered: true, choose: [1,2,3] },
       { context: [['combo', 0], ['comboNumber', 0], ['list', 1]], ordered: true, choose: [1] },
       { context: [['number', 0], ['numberNumberCombo', 0], ['list', 1]], ordered: true, choose: [1] },
       { context: [['number', 1], ['numberNumberCombo', 1], ['combo', 0]], ordered: true, choose: [2] },
       { context: [['combo', 1], ['list', 0], ['number', 1], ['combo', 1]], ordered: true, choose: [2,3] },
       { context: [['list', 0], ['number', 1], ['combo', 1]], ordered: true, choose: [1,2] },
       { context: [['list', 0], ['number', 1], ['smoothie_ingredient', 1], ['smoothie', 0]], ordered: true, choose: [1,2] },

      /*

        { "context": [['number', 0], ['numberNumberCombo', 0], ], "choose": [0] },
        { "context": [['list', 0], ['numberNumberCombo', 0], ], "choose": [0] },
        // [['list', 0], ['comboNumber', 0], ],
        // [['comboNumber', 0], ['list', 0]],
        // this is just to learn associations and contextual_priorities I don't want the semantic to actually run
        // TODO make this learn cp#2 { query: "combo one and (2 combo twos)", skipSemantics: true },
        // TODO make this learn cp#1 { query: "(single and double) combo", skipSemantics: true },
        // cp#1
        { context: [['meal', 0], ['list',0], ['meal', 0], ['combo', 0]], ordered: true, choose: [0,1,2] },
        // cp#2
        // have a way of specifing this
        // { context: [['list',0], ['number', 0], ['combo', 0], ['number', 0]], ordered: true, choose: [comboNumber (in between 2 and 3)] },
        { context: [['list',0], ['number', 0], ['combo', 0], ['number', 0]], ordered: true, choose: [2,3] },
        { context: [['list',0], ['number', 1], ['combo', 0], ['number', 0]], ordered: true, choose: [2,3] },
        { context: [['list',0], ['number', 1], ['combo', 0], ['number', 1]], ordered: true, choose: [2,3] },
        {"context":[["mango_passion_smoothie",1],["list",0],["strawberry",1],['smoothie',1]],"ordered":true,"choose":[2,3]},
        {"context":[["list",0],["number",0],["strawberry",0],['smoothie',0]],"ordered":true,"choose":[1,2]},
        {"context":[["list",0],["number",1],["strawberry",1],['smoothie',0]],"ordered":true,"choose":[1,2]},
        {"context":[["list",0],["number",1],["strawberry",1],['smoothie',1]],"ordered":true,"choose":[1,2]},

        // {"context":[["list",0],["number",1],["strawberry",0],['smoothie',0]],"ordered":true,"choose":[1,2]},
        // {"context":[["list",0],["number",1],["strawberry",0],['smoothie',1]],"ordered":true,"choose":[1,2]},

        // 2 strawberry and 3 mange smoothies
        // 2 strawberry smoothies and 3 mango smoothies
        {"context":[['mango_passion_smoothie', 1],["list",0],["number",1],["strawberry",1],['smoothie',1]],"ordered":true,"choose":[3,4]},
        {"context":[['smoothie', 0],["list",0],["number",1],["strawberry",0],['smoothie',0]],"ordered":true,"choose":[3,4]},
        {"context":[['smoothie', 1],["list",0],["number",1],["strawberry",0],['smoothie',0]],"ordered":true,"choose":[3,4]},
        {"context":[["list",0],["number",1],["strawberry",0],['smoothie',0]],"ordered":true,"choose":[1,2]},
        {"context":[["list",0],["number",1],["strawberry",0],['smoothie',1]],"ordered":true,"choose":[1,2]},

        {"context":[["mango_passion", 1],["list",0],["number",0],["strawberry",0],['smoothie',0]],"ordered":true,"choose":[0,2,3]},
        {"context":[["mango_passion", 1],["list",0],["number",1],["strawberry",0],['smoothie',0]],"ordered":true,"choose":[0,2,3]},
        {"context":[["mango_passion", 1],["list",0],["number",1],["strawberry",1],['smoothie',0]],"ordered":true,"choose":[0,2,3]},
      */
      ],
      generators: [
        {
          where: where(),
          match: ({context}) => false && context.marker == 'combo' && context.comboNumber,
          apply: ({context, g}) => g(context.comboNumber),
        }
      ],
      bridges: [
        { id: 'modification' },
        { 
          id: 'withModification',
          level: 0,
          isA: ['preposition'],
          generatorp: ({context, gp}) => `with ${gp(context.modifications)}`,
          bridge: "{ ...next(operator), modifications: after[0], flatten: false }",
        },
        { 
          id: 'withModification',
          level: 1,
          isA: ['preposition'],
          bridge: "{ ...next(before[0]), postModifiers: append(before[0].postModifiers, ['modifications']), modifications: operator }",
        },
        { 
          id: 'numberNumberCombo_combo',
          convolution: true,
          isA: ['food'],
          before: ['combo', 'counting'],
          bridge: "{ ...next(operator), modifiers: append(before[0].modifiers, ['comboNumber']), comboNumber: before[0], word: 'combo', flatten: true }",
        },
        { 
          id: 'comboMeal',
          convolution: true,
          before: ['meal', 'combo', 'counting'],
          bridge: "{ ...next(after[0]), modifiers: append(before[0].modifiers, ['type']), type: before[0], flatten: true }",
        },
        { 
          id: 'comboNumber',
          convolution: true,
          before: ['combo'],
          bridge: "{ ...next(before[0]), postModifiers: append(before[0].postModifiers, ['comboNumber']), comboNumber: after[0], instance: true, flatten: true }",
        },
        { 
          id: 'numberNumberCombo',
          convolution: true,
          isA: ['food'],
          before: ['combo', 'comboNumber'],
          bridge: "{ ...next(operator), word: 'number', combo: true, postModifiers: append(before[0].postModifiers, ['comboNumber']), comboNumber: after[0], flatten: true }",
        },
      ]
    },
    // TODO "sour cream and chives" is a phrase or maybe just "sour cream and chives"
    // "sour cream and literally modifies chives",
    {
      priorities: [
        { context: [['bacon_list_cheddar_potato', 0], ['cheese_potato', 0]], choose: [0] },
        // TODO make this automatic
        { context: [['crispy_chicken', 0], ['chicken_sandwich', 0], ['chicken_club', 0]], choose: [0] },
        // TODO maybe prefer the one that takes more arguments?
        { context: [['chili_list_cheese_potato', 0], ['cheese_potato', 0]], choose: [0] },
        { context: [['list', 0], ['junior', 0], ['crispy', 0], ['chicken', 0], ['club', 0]], ordered: true, choose: [1,2,3,4] },
        { context: [['meal', 0], ['list', 0], ['meal', 0], ['comboMeal', 0]], ordered: true, choose: [0,1,2] },
        // { context: [['crispy_chicken_club', 0], ['chicken_club', 0], ['chicken_sandwich', 0]], choose: [0] },
        { context: [['breakfast_baconator', 0], ['breakfast_meal', 0]], choose: [0] },
        { context: [['list', 0], ['articlePOS',0], ['smoothie_ingredient', 0], ['smoothie', 0]], ordered: true, choose: [1,2] },
      ]
    },
    "junior modifies crispy chicken club",
    "nuggets, junior bacon cheeseburgers, chicken go wraps and junior crispy chicken clubs are value meals",
    "combos, chili, fries and drinks are sizeable",
    {
      semantics: [
        {
          // split "sprite and fanta" into separate things so the ask will pick them up
          match: ({context}) => context.marker == 'list' && context.topLevel && !context.flatten,
          apply: ({context, s}) => {
            s({...context, flatten: true})
          }
        },
        {
          where: where(),
          match: ({context, api}) => context.marker == 'controlEnd' && api.hasAskedForButNotAvailable(),
          apply: ({context, api, gp, toContext, verbatim}) => {
            const naArray = api.getAskedForButNotAvailable()
            naArray.forEach((f) => f.paraphrase = true)
            const naContext = toContext(naArray)
            /*
            naContext.isResponse = true
            naContext.marker = 'verbatim'
            naContext.verbatim = `The following are not menu items: ${gp(naContext)}`
            insert(naContext)
            */
            verbatim(`The following are not menu items: ${gp(naContext)}`)
            // allow other motivation to run
            context.cascade = true
          }
        },
      ]
    },
    ({ask, api}) => {
      // see if followup for drink is needed

      const hasDrink = (isA, item) => {
        let hasDrink = false
        for (let modification of (item.modifications || [])) {
          if (isA(modification.id, 'drink')) {
            hasDrink = true
            break
          }
        }
        return hasDrink
      }

      const needsDrink = (item) => {
        return item.needsDrink
      }

      const askAbout = ({api, isA}) => {
        const items = []
        for (const item of api.items()) {
          if (needsDrink(item) && !hasDrink(isA, item)) {
            items.push(item)
          }
        }
        return items
      }

      ask([
        {
          where: where(),
          oneShot: false,
          matchq: (args) => askAbout(args).length > 0,
          applyq: (args) => {
            args.context.cascade = true
            const needsDrink = askAbout(args)
            if (needsDrink.length > 1) {
              return `What drinks do you want?`
            } else {
              return `What drink do you want?`
            }
          },
          matchr: (args) => args.isA(args.context.marker, 'drink') && askAbout(args).length > 0,
          applyr: (args) => {
            // TODO check for is available for all modifications
            const needsDrink = askAbout(args)
            const { api, context } = args
            if (isMany(context)) {
              let count = getCount(context) || Number.MAX_SAFE_INTEGER
              for (let item of needsDrink) {
                if (count < 1) {
                  break
                }
                count -= 1
                api.addDrink(item.item_id, { id: context.value }) 
              }
            } else {
              const item_id = needsDrink[0].item_id
              api.addDrink(item_id, { id: context.value }) 
            }
          }
        },
      ])
    },
    {
      priorities: [
        { context: [['combo', 0], ['number',1], ['list', 0], ['combo', 0]], ordered: true, choose: [0,1] },
        { context: [['list', 0], ['combo',0], ['number',1]], ordered: true, choose: [1,2] },
        { context: [['list', 0], ['combo',0], ['list',1]], ordered: true, choose: [1,2] },
        { context: [['mango', 0], ['passion',0], ['list', 0]], ordered: true, choose: [0,1] },
        { context: [['number', 1], ['mango_passion',1], ['list', 0]], ordered: true, choose: [0,1] },
        { context: [['mango', 0], ['mango_passion',0], ['passion',0], ['list', 0]], ordered: true, choose: [0,1,2] },
      ],
    },
  ],
}

class API {
  initialize({ objects, config }) {
    this._objects = objects
    this._objects.items = []
    this._objects.notAvailable = []
  }

  show() {
    this._objects.show = this._objects.items
  }

  // returns an item id so things can be updated if needed
  add(item) {
    item.item_id = this._objects.items.length
    if (!item.modifications) {
      item.modifications = []
    }
    this._objects.items.push(item)
    return item.item_id 
  }

  get(item_id) {
    return this._objects.items[item_id]
  }

  items() {
    return this._objects.items
  }

  addDrink(item_id, drink) {
    this._objects.items[item_id].modifications.push(drink)
    this._objects.items[item_id].needsDrink = false
  }

  say(response) {
    this._objects.response = response
  }

  // return true if you want the NLI layer to handle this
  hasAskedForButNotAvailable(item) {
    return this._objects.notAvailable.length > 0
  }

  getAskedForButNotAvailable(item) {
    const na = this._objects.notAvailable
    this._objects.notAvailable = []
    return na
  }

  addAskedForButNotAvailable(item) {
    this._objects.notAvailable.push(item)
  }

  isAvailable(item) {
    if (item.id == 'chicken_nugget') {
      if (![4,5,6,10].includes(item.pieces)) {
        return false
      }
      if ([4,6].includes(item.pieces)) {
        item.combo = true
      }
    }

    if (['hamburger', 'cheeseburger', 'junior_bacon_cheeseburger', 'junior_crispy_chicken_club', 'chicken_go_wrap'].includes(item.id)) {
      item.combo = true
    }

    if (item.combo) {
      item.needsDrink = true 
      for (let modification of item.modifications || []) {
        // TODO check for awailable
        if (this.args.isA(modification.id, 'drink')) {
          item.needsDrink = false
        }
      }
    }

    if (item.id == 'coke') {
      item.id = 'coca_cola'
    }

    return [
      "hamburger",
      "cheeseburger",
      "crispy_chicken",
      "broccoli_list_cheddar_potato",
      "bacon_list_cheddar_potato",
      "chili_list_cheese_potato",
      "chicken_go_wrap",
      "junior_bacon_cheeseburger",
      "junior_crispy_chicken_club",
      "breakfast_baconator",
      "french_toast_sandwich",
      "egg_muffin",
      "chicken_on_french_toast",
      "pancake_platter",
      "double_sausage_muffin",
      "pancake",
      "french_toast",
      "oatmeal",
      "chicken_nugget",
      "double",
      "french_fry",
      "single",
      "triple",
      'baconator',
      'bacon_deluxe',
      'spicy',
      'homestyle',
      'asiago_range_chicken_club',
      'ultimate_chicken_grill',
      'premium_cod',
      "waffle_fry",
      "strawberry_smoothie",
      "guava_smoothie",
      "mango_passion_smoothie",
      "wild_berry_smoothie",
      "strawberry_banana_smoothie",
      "coca_cola",
      "diet_coke",
      "barq",
      "fanta",
      "sprite",
      "iced_tea",
      "sweet_black_coffee",
      "french_vanilla_coffee",
      "cappuccino_coffee",
      "mocha_shake",
      "caramel_shake",
      "lemonade",
      "strawberry_lemonade",
      "wild_berry_lemonade",
      "loaded_fry",
      "chili_fry",
      "garden_salad",
      "caesar_salad",
      "chili",
      "cheese_potato",
      "vanilla_shake",
      "mango_passion_shake",
      "strawberry_shake",
      "guava_shake",
      "chocolate_shake",
      "banana_shake",
      "wild_berry_shake",
      "vanilla_frosty",
      "chocolate_frosty",
      "apple_pie",
      "apple_pecan_salad",
      "spicy_caesar_salad",
      "taco_salad",
      "southwest_avacado_salad",
    ].includes(item.id)
  }

  getCombo(number) {
    const map = {
      1: 'single',
      2: 'double',
      3: 'triple',
      4: 'baconator',
      5: 'bacon_deluxe',
      6: 'spicy',
      7: 'homestyle',
      8: 'asiago_range_chicken_club',
      9: 'ultimate_chicken_grill',
      10: 'chicken_nugget',
      11: 'premium_cod',
    }
    return map[number]
  }
}

const api = new API()

class State {
  constructor(api) {
    this.api = api
  }

  add(food) {
    let quantity = 1
    if (food.quantity) {
      quantity = food.quantity.value
    }
    let id, combo
    if (food.comboNumber?.marker == 'numberNumberCombo') {
      id = this.api.getCombo(food.comboNumber.comboNumber.value)
      if (!id) {
        this.api.addAskedForButNotAvailable(food)
        return
      }
      combo = true
    }
    else if (food.comboNumber) {
      id = this.api.getCombo(food.comboNumber.value)
      if (!id) {
        this.api.addAskedForButNotAvailable(food)
        return
      }
      combo = true
    } else if (food.marker == 'combo') {
      id = food.type.value
      combo = true
    } else {
      id = food.value
      combo = !!food.combo
    }

    if (id == 'nugget') {
      id = 'chicken_nugget'
    }

    const addSize = (item, data) => {
      if (item.size) {
        data.size = item.size.value
      }
      return data
    }

    let modifications
    if (food.modifications) {
      modifications = []
      for (const modification of propertyToArray(food.modifications.modifications)) {
        if (modification.size) {
          food.size = modification.size
        }
        addSize(modification, { id: modification.value })
        modifications.push(addSize(modification, { id: modification.value }))
      }
    }

    let pieces
    if (food.pieces) {
      pieces = food.pieces.count.value
    } else {
      if (id == 'chicken_nugget') {
        // TODO ask how many pieces
        pieces = 10
      }
    }

    for (let i = 0; i < quantity; ++i) {
      const item = addSize(food, { id, combo, modifications, pieces, food })
      if (!this.api.isAvailable(item)) {
        this.api.addAskedForButNotAvailable(food)
        return
      }

      const item_id = this.api.add(item)

      if (false) {
        // see if followup for drink is needed

        const hasDrink = (item_id) => {
          const item = this.api.get(item_id)
          let hasDrink = false
          for (let modification of (item.modifications || [])) {
            if (!this.api.args.isA(modification.id, 'drink')) {
              hasDrink = true
              break
            }
          }
          return hasDrink
        }
        const needsDrink = (item_id) => {
          const item = this.api.get(item_id)
          return item.needsDrink
        }

        if (!hasDrink(item_id) && needsDrink(item_id)) {
          this.api.args.ask([
              {
                where: where(),
                matchq: ({objects}) => !hasDrink(item_id) && needsDrink(item_id),
                applyq: () => `What drink do you want?`,
                matchr: ({context, isA}) => isA(context.marker, 'drink'),
                applyr: ({context, objects, api}) => {
                  // TODO check for is available for all modifications
                  this.api.addDrink(item_id, { id: context.value }) 
                }
              },
            ]
          )
        }
      }
    }
  }

  // user ask what the order was
  show() {
    this.api.show()
  }

  say(response) {
    this.api.say(response)
  }
}

const createConfig = () => {
  const config = new Config({ 
    name: 'fastfood',
    operators: [
      "([orderNoun|order])",
      "([showOrder|show] ([orderNoun/1]))",
    ],
    // flatten: ['list'],
    // TODO use node naming not python
    semantics: [
      {
        where: where(),
        priority: -10,
        match: ({context}) => context.marker == 'compound_operator',
        apply: ({context, s}) => {
          context.marker = 'list'
          context.flatten = true
          s(context)
        }
      },
      {
        where: where(),
        match: ({context, isAListable}) => isAListable(context, 'edible') && context.marker !== 'edible' && !context.same && !context.isResponse,
        apply: ({context, km, api, instance}) => {
          for (const element of propertyToArray(context)) {
            km('fastfood').api.state.add(element)
          }
        }
      },
    ],
    floaters: ['quantity'],
    bridges: [
      { 
        id: 'orderNoun',
        parents: ['noun', 'queryable'],
        evaluator: ({context, api}) => {
          context.evalue = { marker: 'list', value: api.objects.items }
          api.show()
        }
      },
      { 
        id: 'showOrder',
        parents: ['verby'],
        bridge: "{ ...next(operator), order: after[0] }",
        generatorp: ({context, g}) => `show ${g(context.order)}`,
        semantic: ({api}) => {
          api.state.show()
        },
      },
    ],
  }, module)
  config.stop_auto_rebuild()
  config.add(edible(), countable(), events(), sizeable())
  config.api = api
  config.initializer( ({api}) => {
    api.state = new State(api)
  })
  config.restart_auto_rebuild()
  return config
}

knowledgeModule( {
    module,
    description: 'fastfood related concepts',
    createConfig,
    test: {
            name: './fastfood.test.json',
            contents: fastfood_tests,
            checks: {
              objects: [
                'show', 
                { property: 'items', filter: ['combo', 'pieces', 'size', 'item_id', 'id', 'modifications', 'needsDrink'] },
                'changes', 
                'response', 
                { property: 'notAvailable', filter: [ 'marker', 'value', 'text' ] }, 
                { property: 'quantity', filter: ['marker', 'value', 'text' ] },
                { property: 'pieces', filter: ['marker', 'value', 'text' ] },
              ],
              context: [
                ...defaultContextCheck,
                // TODO some kind of conditional selector { match: (value) => value.marker == 'count', filter: ['marker', 'value', 'text'] },
                { property: 'comboNumber', filter: ['marker', 'value', 'text' ] },
              ],
            },
          },
    template: {
      template,
      instance: fastfood_instance,
    },
})
