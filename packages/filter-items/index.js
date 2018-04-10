function filter (xs, names) {
  const namesSet = new Set()
  names.forEach(name => addName(xs, namesSet, name))
  return Array.from(namesSet).map(name => xs.find(x => x.name === name))
}

module.exports = filter

function addName (xs, set, name) {
  if (!set.has(name)) {
    const found = xs.find(x => x.name === name)
    if (!found) {
      throw new Error(`Cannot find any item with name '${name}'`)
    }
    set.add(name)
    const needed = ensureArray(found.need)
    needed.forEach(name => addName(xs, set, name))
  }
}

function ensureArray (x) {
  if (x == null) return []
  else if (Array.isArray(x)) return x
  else return [x]
}