const Holder = require('the-holder')
const {buildAction} = require('../index')
const natsExItem = require('./lib/items/nats-ex')

describe('action-builder', () => {
  let holder = null

  beforeEach(() => {
    holder = new Holder()
  })

  afterEach(async () => {
    await holder.close()
  })

  test('basic action', async () => {
    const itemDefs = [
      natsExItem,
      {
        name: 'action',
        need: 'natsEx',
        build: ({natsEx}) => buildAction({
          natsEx,
          name: 'ping',
          handler: () => {
            return 'pong'
          }
        })
      },
      {
        name: 'test',
        need: ['natsEx', 'action'],
        build: async ({natsEx}) => {
          const result = await natsEx.call('action.ping')
          expect(result).toBe('pong')
        }
      }
    ]
    await holder.load(itemDefs)
  })

  test('queue group', async () => {
    expect.assertions(1)
    const itemDefs = [
      natsExItem,
      {
        name: 'action',
        need: 'natsEx',
        build: ({natsEx}) => {
          buildAction({
            natsEx,
            name: 'ping',
            handler: () => {
              expect(true).toBe(true)
            }
          })
          buildAction({
            natsEx,
            name: 'ping',
            handler: () => {
              expect(true).toBe(true)
            }
          })
        }
      },
      {
        name: 'test',
        need: ['natsEx', 'action'],
        build: async ({natsEx}) => {
          await natsEx.call('action.ping')
        }
      }
    ]
    await holder.load(itemDefs)
  })

  test('side effect', async () => {
    expect.assertions(2)
    const itemDefs = [
      natsExItem,
      {
        name: 'action',
        need: 'natsEx',
        build: ({natsEx}) => buildAction({
          natsEx,
          name: 'ping',
          handler: (emit) => {
            emit('i-am-ok', 'well')
            return 'pong'
          }
        })
      },
      {
        name: 'test',
        need: ['natsEx', 'action'],
        build: async ({natsEx}) => {
          natsEx.on('action.ping.i-am-ok', (data) => {
            expect(data).toBe('well')
          })
          const result = await natsEx.call('action.ping')
          expect(result).toBe('pong')
        }
      }
    ]
    await holder.load(itemDefs)
  })

  test('side effect', async () => {
    expect.assertions(3)
    const echoData = 'Hello'
    const itemDefs = [
      natsExItem,
      {
        name: 'action',
        need: 'natsEx',
        build: ({natsEx}) => buildAction({
          natsEx,
          name: 'echo',
          handler: (emit, data) => {
            expect(data).toBe(echoData)
            throw new Error('something wrong')
          }
        })
      },
      {
        name: 'test',
        need: ['natsEx', 'action'],
        build: async ({natsEx}) => {
          natsEx.on('action.echo.error', (data) => {
            expect(data).toBe(echoData)
          })
          try {
            await natsEx.call('action.echo', echoData)
          }
          catch (err) {
            expect(err.message).toBe('something wrong')
          }
        }
      }
    ]
    await holder.load(itemDefs)
  })

  describe('validation', () => {
    const validator = (data) => {
      if (typeof data !== 'string') {
        throw new TypeError('invalid data')
      }
      return data
    }

    test('validation ok', async () => {
      const itemDefs = [
        natsExItem,
        {
          name: 'action',
          need: 'natsEx',
          build: ({natsEx}) => buildAction({
            natsEx,
            name: 'echo',
            validator,
            handler: (emit, data) => {
              return data
            }
          })
        },
        {
          name: 'test',
          need: ['natsEx', 'action'],
          build: async ({natsEx}) => {
            const result = await natsEx.call('action.echo', 'Bob')
            expect(result).toBe('Bob')
          }
        }
      ]
      await holder.load(itemDefs)
    })

    test('validation failed', async () => {
      const itemDefs = [
        natsExItem,
        {
          name: 'action',
          need: 'natsEx',
          build: ({natsEx}) => buildAction({
            natsEx,
            name: 'echo',
            validator,
            handler: (emit, data) => {
              return data
            }
          })
        },
        {
          name: 'test',
          need: ['natsEx', 'action'],
          build: async ({natsEx}) => {
            try {
              await natsEx.call('action.echo', 123)
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