const loadItems = require('../index')

describe('loadItems', function () {
  it('should load items', () => {
    const items = loadItems({
      dirname: __dirname + '/a'
    })
    expect(items.length).toBe(2)
    expect(items.find(x => x.name === 'Alan')).toBeTruthy()
    expect(items.find(x => x.name === 'b/cC/bobBob')).toBeTruthy()
  })

  it('should load items with prefix', () => {
    const items = loadItems({
      dirname: __dirname + '/d',
      prefix: 'service/'
    })
    expect(items[0].name).toBe('service/e/lucy')
  })
})