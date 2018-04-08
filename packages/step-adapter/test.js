const Holder = require('the-holder')
const adaptStep = require('./index')
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
    holder = new Holder({adapters: {step: adaptStep}})
  })

  afterEach(async () => {
    await holder.close()
  })

  test('basic step', async () => {
    expect.assertions(2)
    await holder.load([
      natsExItem,
      {
        type: 'step',
        name: 'step',
        need: 'natsEx',
        serviceName: 'test',
        flowName: 'flow',
        stepName: 'step',
        emitCases: {ok: 'ok'},
        handler () {
          expect(typeof this.items.natsEx).toBe('object')
          this.emit.ok('Hello World')
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')
    natsEx.on('step.test.flow.step.ok', (data) => {
      expect(data).toBe('Hello World')
    })
    await natsEx.call('step.test.flow.step')
  })

  test('option.follow', async () => {
    expect.assertions(1)
    await holder.load([
      natsExItem,
      {
        type: 'step',
        name: 'step',
        need: 'natsEx',
        flowName: 'test-flow',
        stepName: 'test-step',
        follow: {
          step: 'some-step',
          case: 'ok'
        },
        emitCases: {ok: 'ok'},
        handler () {
          this.emit.ok('Hello World')
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')
    natsEx.on('step.test-flow.test-step.ok', (data) => {
      expect(data).toBe('Hello World')
    })
    await natsEx.call('step.test-flow.some-step.ok')
  })

  test('follow many', async () => {
    expect.assertions(2)
    await holder.load([
      natsExItem,
      {
        type: 'step',
        name: 'step',
        need: 'natsEx',
        flowName: 'test-flow',
        stepName: 'test-step',
        follow: [
          {
            step: 'some-step',
            case: 'ok'
          },
          {
            step: 'other-step',
            case: 'ok'
          }
        ],
        emitCases: {
          ok: 'ok'
        },
        handler () {
          this.emit.ok('Hello World')
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')

    natsEx.on('step.test-flow.test-step.ok', (data) => {
      expect(data).toBe('Hello World')
    })

    natsEx.emit('step.test-flow.some-step.ok')
    natsEx.emit('step.test-flow.other-step.ok')

    await sleep(10)
  })

  test('validation', async () => {
    expect.assertions(2)

    const testValidator = (data) => {
      if (typeof data !== 'string') {
        throw new TypeError('invalid data')
      }
      return Number(data)
    }

    await holder.load([
      natsExItem,
      {
        type: 'step',
        name: 'step',
        need: 'natsEx',
        flowName: 'test-flow',
        stepName: 'test-step',
        validator: testValidator,
        handler (data) {
          expect(typeof data).toBe('number')
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')

    await natsEx.call('step.test-flow.test-step', '100')

    try {
      await natsEx.call('step.test-flow.test-step', 100)
    } catch (err) {
      expect(err.message).toBe('invalid data')
    }
  })

  test('queue group', async () => {
    const count = {
      a: 0,
      b: 0,
    }
    await holder.load([
      natsExItem,
      {
        type: 'step',
        name: 'a',
        need: 'natsEx',
        flowName: 'test-flow',
        stepName: 'test-step',
        follow: {
          step: 'some-step',
          case: 'ok'
        },
        handler () {
          count.a++
        }
      },
      {
        type: 'step',
        name: 'b',
        need: 'natsEx',
        flowName: 'test-flow',
        stepName: 'test-step',
        follow: {
          step: 'some-step',
          case: 'ok'
        },
        handler () {
          count.a++
        }
      },
      {
        type: 'step',
        name: 'c',
        need: 'natsEx',
        flowName: 'test-flow',
        stepName: 'test-step2',
        follow: {
          step: 'some-step',
          case: 'ok'
        },
        handler () {
          count.b++
        }
      },
    ])
    const natsEx = holder.getItem('natsEx')
    await natsEx.call('step.test-flow.some-step.ok')
    expect(count).toEqual({
      a: 1,
      b: 1,
    })
  })

  test('validator in follow', async () => {
    expect.assertions(2)
    await holder.load([
      natsExItem,
      {
        type: 'step',
        name: 'step',
        need: 'natsEx',
        flowName: 'test-flow',
        stepName: 'test-step',
        follow: {
          step: 'some-step',
          case: 'ok',
          validator: (data) => {
            if (data === 'Bob') return data
            else throw new TypeError('data is not Bob')
          }
        },
        emitCases: {
          ok: 'ok'
        },
        handler () {
          this.emit.ok('Hello Bob')
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')

    natsEx.on('step.test-flow.test-step.ok', (data) => {
      expect(data).toBe('Hello Bob')
    })

    await natsEx.call('step.test-flow.some-step.ok', 'Bob')

    try {
      await natsEx.call('step.test-flow.some-step.ok', 'Alice')
    } catch (err) {
      expect(err.message).toBe('data is not Bob')
    }
  })

  test('option.emitCases', async () => {
    expect.assertions(1)
    await holder.load([
      natsExItem,
      {
        type: 'step',
        name: 'step',
        need: 'natsEx',
        flowName: 'test-flow',
        stepName: 'test-step',
        emitCases: {
          ok: 'i-am-ok'
        },
        handler () {
          this.emit.ok('Hello')
        }
      }
    ])
    const natsEx = holder.getItem('natsEx')

    natsEx.on('step.test-flow.test-step.i-am-ok', (data) => {
      expect(data).toBe('Hello')
    })

    await natsEx.call('step.test-flow.test-step')
  })
})