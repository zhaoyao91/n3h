const filter = require('./')

describe('filter', () => {
  it('should filter out specified items', () => {
    const all = [
      {name: 'a'},
      {name: 'b'},
      {name: 'c'},
      {name: 'd', need: 'a'}
    ]

    const filtered = filter(all, ['c', 'd'])

    expect(filtered).toEqual([
      {name: 'c'},
      {name: 'd', need: 'a'},
      {name: 'a'},
    ])
  })

  it('throw error if item not found', () => {
    expect.assertions(1)

    const all = [
      {name: 'a'},
      {name: 'b'},
      {name: 'c'},
    ]

    try {
      const filtered = filter(all, ['a', 'c', 'unknown'])
    } catch (err) {
      expect(err.message).toBe(`Cannot find any item with name 'unknown'`)
    }
  })
})