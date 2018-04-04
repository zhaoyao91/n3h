function filter (xs, names) {
  return names.map(name => {
    const found = xs.find(x => x.name === name)
    if (!found) {
      throw new Error(`Cannot find any item with name '${name}'`)
    }
    return found
  })
}

module.exports = filter
