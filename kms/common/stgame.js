const { Config, knowledgeModule, where } = require('./runtime').theprogrammablemind
const createCharacters = require('./characters')
const stgame_tests = require('./stgame.test.json')
const createKirk = require('./kirk')
const createSpock = require('./spock')

const characters = createCharacters()
const kirk = createKirk()
const spock = createSpock()

class API {
  response({context, result}) {
    console.log('----------------------------------------')
    console.log(`${context.value} says: `, result.paraphrases)
    console.log('----------------------------------------')
  }

  initialize() {
  }
}
const api = new API()

class KirkAPI {
  initialize() {
  }

  getName() {
    return "kirk"
  }

  process(config, utterance) {
    kirk.server(config.getServer(), config.getAPIKey())
    return kirk.process(utterance, { credentials: this.credentials })
  }
  
  response({km, context, result}) {
    km('stgame').api.response({context, result})
  }
}

characters.api = new KirkAPI();

class SpockAPI {
  initialize() {
  }

  getName() {
    return "spock"
  }

  process(config, utterance) {
    spock.server(config.getServer(), config.getAPIKey())
    return spock.process(utterance, { credentials: this.credentials })
  }
  
  response({km, context, result}) {
    km('stgame').api.response({context, result})
  }
}
characters.api = new SpockAPI();

const createConfig = () => {
  const config = new Config({ 
      name: 'stgame', 
      operators: [ "([a])" ],
      bridges: [ { id: 'a', level: 0, bridge: "{ ...next(operator) }" } ],
      words: {"?": [{"id": "a", "initial": "{}" }]},
  }, module)
  config.api = api
  config.add(characters)
  return config
}

knowledgeModule( {
  module,
  description: 'Game simulator for trek-like characters',
  createConfig,
  test: {
          name: './stgame.test.json',
          contents: stgame_tests
        },
})
