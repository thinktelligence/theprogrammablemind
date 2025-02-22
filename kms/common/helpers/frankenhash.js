const _ = require('lodash')

class Frankenhash {
  constructor(data) {
    this.data = data
    this.data.root = {}
    this.data.handlers = {}
    this.data.initHandlers = []
  }

  setInitHandler({path, handler}) {
    this.data.initHandlers.push( { path, handler } )
  }

  setHandler(path, handler) {
    let where = this.data.handlers
    for (const arg of path.slice(0, path.length-1)) {
      if (!where[arg]) {
        where[arg] = {}
      }
      where = where[arg]
    }
    where[path[path.length-1]] = handler
  }

  getValue(path, writeDefault=true) {
    let value = this.data.root
    for (const property of path) {
      if (!value[property]) {
        if (writeDefault) {
          value[property] = {}
        } else {
          return null
        }
      }
      value = value[property]
    }
    return value
  }

  isHandler(value) {
    return value && !!value.getValue && !!value.setValue
  }

  getHandler(path) {
    let value = this.data.handlers
    for (const property of path) {
      if (this.isHandler(value)) {
        return value
      }
      value = value || {}
      value = value[property]
    }
    return value
  }

  knownProperty(path) {
    let value = this.data.root;
    for (const property of path) {
      if (!value[property]) {
        return false
      }
      value = value[property]
    }
    return !!value
  }


  ensureValue(path, value, has=true) {
    if (!this.getValue(path)) {
      this.setValue(path, value, has)
    }
  }

  setValue(path, value, has) {
    const prefix = path.slice(0, path.length - 1)
    const last = path[path.length-1]
    this.getValue(prefix)[last] = {has, value} || undefined
  }
}

module.exports = {
  Frankenhash,
}
