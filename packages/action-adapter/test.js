const Holder = require('the-holder')
const actionAdapter = require('./index')
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
    holder = new Holder({adapters: {action: actionAdapter}})
  })

  afterEach(async () => {
    await holder.close()
  })

  test('basic action', async () => {
    await holder.load([
        natsExItem,
        {
          type: 'action',
          name: 'whatever',
          need: ['natsEx'],
          serviceName: 'test',
          actionName: 'ping',
          handler () {
            return 'pong'
          }
        }
      ]
    )
    const natsEx = holder.getItem('natsEx')

    const result = await natsEx.call('action.test.ping')
    expect(result).toBe('pong')
  })

  test('queue group', async () => {
    expect.assertions(1)
    await holder.load([
      natsExItem,
      {
        type: 'action',
        name: 'whatever1',
        need: 'natsEx',
        actionName: 'ping',
        handler () {
          expect(true).toBe(true)
        }
      },
      {
        type: 'action',
        name: 'whatever2',
        need: 'natsEx',
        actionName: 'ping',
        handler () {
          expect(true).toBe(true)
        }
      },
    ])
    const natsEx = holder.getItem('natsEx')

    await natsEx.call('action.ping')
  })

  test('side effect', async () => {
    expect.assertions(2)
    await holder.load([
      natsExItem,
      {
        type: 'action',
        name: 'whatever',
        need: 'natsEx',
        actionName: 'ping',
        emitCases: {
          fine: 'i-am-ok'
        },
        handler () {
          this.emit.fine('well')
          return 'pong'
        }
      },
    ])
    const natsEx = holder.getItem('natsEx')

    natsEx.on('action.ping.i-am-ok', (data) => {
      expect(data).toBe('well')
    })
    const result = await natsEx.call('action.ping')
    expect(result).toBe('pong')
  })

  test('error', async () => {
    expect.assertions(2)
    const echoData = 'Hello'
    await holder.load([
      natsExItem,
      {
        type: 'action',
        name: 'action',
        need: 'natsEx',
        actionName: 'echo',
        handler (data) {
          expect(data).toBe(echoData)
          throw new Error('something wrong')
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')

    try {
      await natsEx.call('action.echo', echoData)
    }
    catch (err) {
      expect(err.message).toBe('something wrong')
    }
  })

  test('validation', async () => {
    expect.assertions(2)

    const validator = buildValidator(Joi.string().required())

    await holder.load([
      natsExItem,
      {
        type: 'action',
        name: 'action',
        need: 'natsEx',
        actionName: 'echo',
        validator,
        handler (data) {
          return data
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')

    const result = await natsEx.call('action.echo', 'Bob')
    expect(result).toBe('Bob')

    try {
      await natsEx.call('action.echo', 123)
    }
    catch (err) {
      expect(err.message).toBe('"value" must be a string')
    }
  })

  test('map items', async () => {
    await holder.load([
        natsExItem,
        {
          type: 'action',
          name: 'whatever',
          need: ['natsEx'],
          serviceName: 'test',
          actionName: 'ping',
          mapItems: (items) => {
            expect(typeof items.natsEx).toBe('object')
            return {
              ...items,
              magic: 'boom'
            }
          },
          handler () {
            expect(this.items.magic).toBe('boom')
            return 'pong'
          }
        }
      ]
    )
    const natsEx = holder.getItem('natsEx')

    const result = await natsEx.call('action.test.ping')
    expect(result).toBe('pong')
  })
})