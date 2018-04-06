const Holder = require('the-holder')
const buildMapper = require('./index')
const {connect} = require('nats-ex')

const natsExItem = {
  name: 'natsEx',
  build: async () => {
    const natsEx = await connect()
    return {
      item: natsEx,
      stop: () => natsEx.close()
    }
  }
}

describe('mapper-builder', () => {
  let holder = null

  beforeEach(() => {
    holder = new Holder()
  })

  afterEach(async () => {
    await holder.close()
  })

  test('basic mapper', (done) => {
    const itemDefs = [
      natsExItem,
      {
        name: 'mapper',
        need: 'natsEx',
        build: ({natsEx}) => buildMapper({
          natsEx,
          name: 'mapper',
          inTopic: 'in',
          outTopic: 'out',
          mapData: async (data) => data + data
        })
      },
      {
        name: 'test',
        need: ['natsEx', 'mapper'],
        build: async ({natsEx}) => {
          natsEx.on('out', (data) => {
            expect(data).toBe('HelloHello')
            done()
          })
          natsEx.emit('in', 'Hello')
        }
      }
    ]
    holder.load(itemDefs)
  })

  describe('validator', () => {
    const validator = (data) => {
      if (data !== 'Bob') throw new TypeError('invalid data')
      return data
    }

    test('validation ok', (done) => {
      const itemDefs = [
        natsExItem,
        {
          name: 'mapper',
          need: 'natsEx',
          build: ({natsEx}) => buildMapper({
            natsEx,
            name: 'mapper',
            inTopic: 'in',
            outTopic: 'out',
            validator,
          })
        },
        {
          name: 'test',
          need: ['natsEx', 'mapper'],
          build: async ({natsEx}) => {
            natsEx.on('out', (data) => {
              expect(data).toBe('Bob')
              done()
            })
            natsEx.emit('in', 'Bob')
          }
        }
      ]
      holder.load(itemDefs)
    })

    test('validation failed', async () => {
      expect.assertions(1)
      const itemDefs = [
        natsExItem,
        {
          name: 'mapper',
          need: 'natsEx',
          build: ({natsEx}) => buildMapper({
            natsEx,
            name: 'mapper',
            inTopic: 'in',
            outTopic: 'out',
            validator,
          })
        },
        {
          name: 'test',
          need: ['natsEx', 'mapper'],
          build: async ({natsEx}) => {
            try {
              await natsEx.call('in', 'Alice')
            }
            catch (err) {
              expect(err.message).toBe('invalid data')
            }
          }
        }
      ]
      await holder.load(itemDefs)
    })
  })
})