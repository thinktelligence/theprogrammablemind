const calculateLefts = (defs) => {
  const lefts = {}
  calculateLeftsHelper(defs, lefts)
  return lefts
}

const calculateLeftsHelper = (defs, lefts) => {
  if (Array.isArray(defs)) {
    let previous
    for (const def of defs) {
      if (previous) {
        lefts[def.key] = previous.key
        previous = def
      } else {
        previous = def
      }
    }
  }
  return lefts
}

const calculateRights = (defs) => {
  const rights = {}
  calculateRightsHelper(defs, rights)
  return rights
}

const calculateRightsHelper = (defs, rights) => {
  if (Array.isArray(defs)) {
    let previous
    for (const def of defs) {
      if (previous) {
        rights[previous.key] = def.key
        previous = def
      } else {
        previous = def
      }
    }
  }
  return rights
}

const calculateDowns = (defs) => {
  const downs = {}
  calculateDownsHelper(defs, downs)
  return downs
}

const calculateDownsHelper = (defs, downs) => {
  if (Array.isArray(defs)) {
    for (const def of defs) {
      calculateDownsHelper(def, downs)
    }
  } else if (defs.children) {
    if (defs.children.length > 0) {
      downs[defs.key] = defs.children[0].key
    }

    let previous
    for (const child of defs.children) {
      if (child.divider) {
        continue
      }
      if (previous) {
        downs[previous.key] = child.key
        previous = child
      } else {
        previous = child
      }
    }
  }
  return downs
}

const calculateUps = (defs) => {
  const ups = {}
  calculateUpsHelper(defs, ups)
  return ups
}

const calculateUpsHelper = (defs, ups) => {
  if (Array.isArray(defs)) {
    for (const def of defs) {
      calculateUpsHelper(def, ups)
    }
  } else if (defs.children) {
    let previous
    for (const child of defs.children) {
      if (child.divider) {
        continue
      }
      if (previous) {
        ups[child.key] = previous.key
        previous = child
      } else {
        previous = child
      }
    }
  }
  return ups
}

const calculateParents = (defs) => {
  const parents = {}
  calculateParentsHelper(defs, parents)
  return parents
}

const calculateParentsHelper = (defs, parents) => {
  if (Array.isArray(defs)) {
    for (const def of defs) {
      parents[def.key] = def.key
      calculateParentsHelper(def, parents)
    }
  } else if (defs.children) {
    for (const child of defs.children) {
      if (child.divider) {
        continue
      }
      parents[child.key] = defs.key
    }
  }
  return parents
}

module.exports = {
  calculateRights,
  calculateLefts,
  calculateDowns,
  calculateUps,
  calculateParents,
}
