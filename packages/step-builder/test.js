const Holder = require('the-holder')
const buildStep = require('./index')
const sleep = require('sleep-promise')
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

describe('step-builder', () => {
  let holder = null

  beforeEach(() => {
    holder = new Holder()
  })

  afterEach(async () => {
    await holder.close()
  })

  test('basic step', (done) => {
    const itemDefs = [
      natsExItem,
      {
        name: 'step',
        need: 'natsEx',
        build: ({natsEx}) => buildStep({
          natsEx,
          flowName: 'test-flow',
          stepName: 'test-step',
          handler () {
            this.emit.ok('Hello World')
          }
        })
      },
      {
        name: 'test',
        need: ['natsEx', 'step'],
        build: async ({natsEx}) => {
          natsEx.on('flow.test-flow.test-step.ok', (data) => {
            expect(data).toBe('Hello World')
            done()
          })
          natsEx.emit('flow.test-flow.test-step')
        }
      }
    ]
    holder.load(itemDefs)
  })

  test('option.follow', (done) => {
    const itemDefs = [
      natsExItem,
      {
        name: 'step',
        need: 'natsEx',
        build: ({natsEx}) => buildStep({
          natsEx,
          flowName: 'test-flow',
          stepName: 'test-step',
          follow: 'some-step.ok',
          handler () {
            this.emit.ok('Hello World')
          }
        })
      },
      {
        name: 'test',
        need: ['natsEx', 'step'],
        build: async ({natsEx}) => {
          natsEx.on('flow.test-flow.test-step.ok', (data) => {
            expect(data).toBe('Hello World')
            done()
          })
          natsEx.emit('flow.test-flow.some-step.ok')
        }
      }
    ]
    holder.load(itemDefs)
  })

  describe('option.validator', () => {
    const testValidator = (data) => {
      if (typeof data !== 'string') {
        throw new TypeError('invalid data')
      }
      return Number(data)
    }

    test('validation ok', (done) => {
      const itemDefs = [
        natsExItem,
        {
          name: 'step',
          need: 'natsEx',
          build: ({natsEx}) => buildStep({
            natsEx,
            flowName: 'test-flow',
            stepName: 'test-step',
            validator: testValidator,
            handler (data) {
              expect(typeof data).toBe('number')
              done()
            }
          })
        },
        {
          name: 'test',
          need: ['natsEx', 'step'],
          build: ({natsEx}) => {
            natsEx.emit('flow.test-flow.test-step', '100')
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
          name: 'step',
          need: 'natsEx',
          build: ({natsEx}) => buildStep({
            natsEx,
            flowName: 'test-flow',
            stepName: 'test-step',
            validator: testValidator,
            handler (data) {
              return data
            }
          })
        },
        {
          name: 'test',
          need: ['natsEx', 'step'],
          build: async ({natsEx}) => {
            try {
              await natsEx.call('flow.test-flow.test-step', 100)
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

  test('emit all kinds of messages', async () => {
    expect.assertions(4)
    const itemDefs = [
      natsExItem,
      {
        name: 'step',
        need: 'natsEx',
        build: ({natsEx}) => buildStep({
          natsEx,
          flowName: 'test-flow',
          stepName: 'test-step',
          handler () {
            this.emit.ok('ok')
            this.emit.okCase('well', 'ok well')
            this.emit.failed('failed')
            this.emit.failedCase('bad', 'failed bad')
          }
        })
      },
      {
        name: 'test',
        need: ['natsEx', 'step'],
        build: async ({natsEx}) => {
          natsEx.on('flow.test-flow.test-step.ok', (data) => {
            expect(data).toBe('ok')
          })
          natsEx.on('flow.test-flow.test-step.ok.well', (data) => {
            expect(data).toBe('ok well')
          })
          natsEx.on('flow.test-flow.test-step.failed', (data) => {
            expect(data).toBe('failed')
          })
          natsEx.on('flow.test-flow.test-step.failed.bad', (data) => {
            expect(data).toBe('failed bad')
          })
          natsEx.emit('flow.test-flow.test-step')
        }
      }
    ]
    await holder.load(itemDefs)
    await sleep(50)
  })

  test('queue group', async () => {
    const count = {
      a: 0,
      b: 0,
    }
    const itemDefs = [
      natsExItem,
      {
        name: 'step',
        need: 'natsEx',
        build: ({natsEx}) => {
          buildStep({
            natsEx,
            flowName: 'test-flow',
            stepName: 'test-step',
            follow: 'some-step.ok',
            handler () {
              count.a++
            }
          })
          buildStep({
            natsEx,
            flowName: 'test-flow',
            stepName: 'test-step',
            follow: 'some-step.ok',
            handler () {
              count.a++
            }
          })
          buildStep({
            natsEx,
            flowName: 'test-flow',
            stepName: 'test-step2',
            follow: 'some-step.ok',
            handler () {
              count.b++
            }
          })
        }
      },
      {
        name: 'test',
        need: ['natsEx', 'step'],
        build: async ({natsEx}) => {
          natsEx.emit('flow.test-flow.some-step.ok')
          await sleep(10)
          expect(count).toEqual({
            a: 1,
            b: 1,
          })
        }
      }
    ]
    await holder.load(itemDefs)
  })
})