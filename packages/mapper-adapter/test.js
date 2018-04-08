const Holder = require('the-holder')
const mapperAdapter = require('./index')
const buildValidator = require('n3h-joi-validator')
const Joi = require('joi')
const {connect} = require('nats-ex')
const sleep = require('sleep-promise')

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
    holder = new Holder({adapters: {mapper: mapperAdapter}})
  })

  afterEach(async () => {
    await holder.close()
  })

  test('basic mapper', async () => {
    await holder.load([
        natsExItem,
        {
          type: 'mapper',
          name: 'whatever',
          need: ['natsEx'],
          serviceName: 'test',
          mapperName: 'a-to-b',
          inTopic: 'a',
          outTopic: 'b'
        }
      ]
    )
    const natsEx = holder.getItem('natsEx')

    const promise = new Promise((resolve, reject) => {
      natsEx.on('b', () => {
        resolve()
      })
    })
    natsEx.emit('a')
    await promise
  })

  test('queue group', async () => {
    expect.assertions(1)
    await holder.load([
        natsExItem,
        {
          type: 'mapper',
          name: 'whatever1',
          need: ['natsEx'],
          serviceName: 'test',
          mapperName: 'a-to-b',
          inTopic: 'a',
          outTopic: 'b'
        },
        {
          type: 'mapper',
          name: 'whatever2',
          need: ['natsEx'],
          serviceName: 'test',
          mapperName: 'a-to-b',
          inTopic: 'a',
          outTopic: 'b'
        }
      ]
    )
    const natsEx = holder.getItem('natsEx')

    natsEx.on('b', (data) => {
      expect(data).toBe('ping')
    })
    natsEx.emit('a', 'ping')
    await sleep(10)
  })

  test('map data', async () => {
    await holder.load([
        natsExItem,
        {
          type: 'mapper',
          name: 'whatever',
          need: ['natsEx'],
          serviceName: 'test',
          mapperName: 'a-to-b',
          inTopic: 'a',
          outTopic: 'b',
          async mapData (data) {
            return data + data
          }
        }
      ]
    )
    const natsEx = holder.getItem('natsEx')

    const promise = new Promise((resolve, reject) => {
      natsEx.on('b', (data) => {
        expect(data).toBe('pingping')
        resolve()
      })
    })
    natsEx.emit('a', 'ping')
    await promise
  })

  test('validation', async () => {
    expect.assertions(2)

    const validator = buildValidator(Joi.string().required())

    await holder.load([
      natsExItem,
      {
        type: 'mapper',
        name: 'whatever',
        need: 'natsEx',
        mapperName: 'a-to-b',
        validator,
        inTopic: 'a',
        outTopic: 'b',
        mapData (x) {
          expect(x).toBeTruthy()
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')

    await natsEx.call('a', 'Bob')

    try {
      await natsEx.call('a', 123)
    }
    catch (err) {
      expect(err.message).toBe('"value" must be a string')
    }
  })
})