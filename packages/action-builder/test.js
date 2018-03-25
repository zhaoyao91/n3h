const Holder = require('the-holder')
const buildAction = require('./index')
const buildValidator = require('n3h-joi-validator')
const Joi = require('joi')
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
          handler () {
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
            handler () {
              expect(true).toBe(true)
            }
          })
          buildAction({
            natsEx,
            name: 'ping',
            handler () {
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
          handler () {
            this.emit('i-am-ok', 'well')
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

  test('error', async () => {
    expect.assertions(2)
    const echoData = 'Hello'
    const itemDefs = [
      natsExItem,
      {
        name: 'action',
        need: 'natsEx',
        build: ({natsEx}) => buildAction({
          natsEx,
          name: 'echo',
          handler (data) {
            expect(data).toBe(echoData)
            throw new Error('something wrong')
          }
        })
      },
      {
        name: 'test',
        need: ['natsEx', 'action'],
        build: async ({natsEx}) => {
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
    const validator = buildValidator(Joi.string().required())

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
            handler (data) {
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
            handler (data) {
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
              expect(err.message).toBe('"value" must be a string')
            }
          }
        }
      ]
      await holder.load(itemDefs)
    })
  })
})