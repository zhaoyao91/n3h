const filter = require('./')

describe('filter', () => {
  it('should filter out specified items', () => {
    const all = [
      {name: 'a'},
      {name: 'b'},
      {name: 'c'},
    ]

    const filtered = filter(all, ['a', 'c'])

    expect(filtered).toEqual([
      {name: 'a'},
      {name: 'c'}
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