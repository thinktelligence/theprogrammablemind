const client = require('./runtime').theprogrammablemind.client
const config = require('./store')

const testData = {
  types: [ 'tanks', 'planes' ],
  products: [
    { marker: 'product', isInstance: true, type: 'tanks', name: 'Tamiya Tiger', cost: 9, id: 1 },
    { marker: 'product', isInstance: true, type: 'planes', name: 'P-47', cost: 15, id: 2 },
  ]
}

const api_interface = {
  getTypes: () => testData.types,
  getAllProducts: () => testData.products,
  getByTypeAndCost: ({type, cost, comparison}) => {
    results = []
    testData.forEach( (product) => {
      if (product.type == type && comparison(product.cost)) {
        results.append(product)
      }
    })
    return results
  },
  productGenerator: [({context}) => context.marker == 'product' && context.isInstance, ({g, context}) => `${context.name}`]
};

config.get('objects').interface = api_interface;
url = "http://184.67.27.82"
key = "6804954f-e56d-471f-bbb8-08e3c54d9321"
config.set("utterances", ['list products'])
client.process(url, key, config).then( (response) => {
  //console.log(JSON.stringify(response, null, 2))
  console.log(response.generated[0])
})
