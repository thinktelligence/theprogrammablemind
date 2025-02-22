const Digraph = require('../runtime').theprogrammablemind.Digraph

class API {

  createOrdering({ name, categories=[], ordering=[] }) {
    // sections = [slow fast] [love like hate detest] # ordered sections
    // instances = x < y x == y x != y 
    this._objects[name] = {
      categories,
      contextToObjectToCategory: {},
      lessThans: [],
      ordering,
    }
  }

  setCategory(name, context, object, category) {
    // categories: context -> object -> category ie greg banana like
    if (!this._objects[name].contextToObjectToCategory[context]) {
      this._objects[name].contextToObjectToCategory[context] = {}
    }
    this._objects[name].contextToObjectToCategory[context][object] = category
    category.truthValue = true
  }

  getCategory(name, context, object) {
    return this._objects[name].contextToObjectToCategory[context][object]
  }

  inCategory(name, context, object, category) {
    const digraph = new Digraph(this._objects[name].categories)
    return digraph.isA(this.getCategory(name, context, object), category)
  }

  setLessThan( {name, context, smaller, larger} ) {
    if (!this._objects[name].lessThans[context]) {
      this._objects[name].lessThans[context] = []
    }
    this._objects[name].lessThans[context].push( [smaller, larger] )
  }

  getLessThan( {name, context, smaller, larger} ) {
    const digraph = new Digraph(this._objects[name].lessThans[context])

    // try the edges first

    if (smaller && larger) {
      if (digraph.lessThan(smaller, larger)) {
        return [{name, context, smaller, larger}]
      } else {
        // fall to trying the categories
      }
    } else if (larger) {
      const edges = []
      for (const smaller of digraph.descendants(larger)) {
        edges.push({ smaller, context, larger, name })
      }
      return edges;
    } else if (smaller) {
      const edges = []
      for (const larger of digraph.ancestors(smaller)) {
        edges.push({ smaller, context, larger, name })
      }
      return edges;
    }

    // try the categories instead
    if (smaller && larger) {
      const smallerCat = this.getCategory(name, context, smaller)
      const largerCat = this.getCategory(name, context, larger)
      if (smallerCat && largerCat) {
        return new Digraph(this._objects[name].ordering).lessThan(smallerCat, largerCat)
      }
    }
  }

  initialize({km, objects}) {
    if (km('properties')) {
      this.propertiesAPI = km('properties').api
      this._objects = objects
    }
  }

}

module.exports = {
  API
}
