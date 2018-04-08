const Holder = require('the-holder')
const reactorAdapter = require('./index')
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

describe('reactor-builder', () => {
  let holder = null

  beforeEach(() => {
    holder = new Holder({adapters: {reactor: reactorAdapter}})
  })

  afterEach(async () => {
    await holder.close()
  })

  test('basic action', async () => {
    await holder.load([
      natsExItem,
      {
        type: 'reactor',
        name: 'whatever',
        need: ['natsEx'],
        serviceName: 'test',
        reactorName: 'hello',
        on: 'ping',
        handler (data) {
          expect(data).toBe('ping')
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')

    await natsEx.call('ping', 'ping')
  })

  test('queue group', async () => {
    expect.assertions(1)
    await holder.load([
      natsExItem,
      {
        type: 'reactor',
        name: 'whatever1',
        need: 'natsEx',
        reactorName: 'reactor',
        on: 'ping',
        handler () {
          expect(true).toBe(true)
        }
      },
      {
        type: 'reactor',
        name: 'whatever2',
        need: 'natsEx',
        reactorName: 'reactor',
        on: 'ping',
        handler () {
          expect(true).toBe(true)
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')

    await natsEx.call('ping')
  })

  test('side effect', async () => {
    expect.assertions(1)
    await holder.load([
      natsExItem,
      {
        type: 'reactor',
        name: 'whatever',
        need: 'natsEx',
        reactorName: 'reactor',
        on: 'ping',
        emitCases: {
          fine: 'i-am-ok'
        },
        handler () {
          this.emit.fine('well')
        }
      },
    ])
    const natsEx = holder.getItem('natsEx')

    natsEx.on('reactor.reactor.i-am-ok', (data) => {
      expect(data).toBe('well')
    })
    await natsEx.call('ping')
  })

  test('error', async () => {
    expect.assertions(1)
    await holder.load([
      natsExItem,
      {
        type: 'reactor',
        name: 'whatever',
        need: 'natsEx',
        reactorName: 'reactor',
        on: 'error',
        handler () {
          throw new Error('something wrong')
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')

    try {
      await natsEx.call('error')
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
        type: 'reactor',
        name: 'whatever',
        need: 'natsEx',
        reactorName: 'reactor',
        on: 'ping',
        validator,
        handler (data) {
          return data
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')

    const result = await natsEx.call('ping', 'Bob')
    expect(result).toBe('Bob')

    try {
      await natsEx.call('ping', 123)
    }
    catch (err) {
      expect(err.message).toBe('"value" must be a string')
    }
  })
})