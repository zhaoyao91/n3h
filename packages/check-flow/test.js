const checkFlow = require('./index')

describe('checkFlow', () => {
  it('should allow valid checking', () => {
    const steps = [
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step1',
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step2',
        follow: {step: 'step1', case: 'ok'},
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step3',
        follow: [
          {step: 'step1', case: 'failed'},
          {step: 'step2', case: 'failed'}
        ]
      }
    ]
    checkFlow(steps, {
      serviceName: 'service',
      flowName: 'flow',
      entries: ['step1'],
      follows: [
        ['step2', 'step1', 'ok'],
        ['step3', 'step1', 'failed'],
        ['step3', 'step2', 'failed']
      ]
    })
  })

  it('should reject step with wrong service name', () => {
    const steps = [
      {
        serviceName: 'service-boom',
        flowName: 'flow',
        stepName: 'step1',
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step2',
        follow: {step: 'step1', case: 'ok'},
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step3',
        follow: [
          {step: 'step1', case: 'failed'},
          {step: 'step2', case: 'failed'}
        ]
      }
    ]
    expect(() => {
      checkFlow(steps, {
        serviceName: 'service',
        flowName: 'flow',
        entries: ['step1'],
        follows: [
          ['step2', 'step1', 'ok'],
          ['step3', 'step1', 'failed'],
          ['step3', 'step2', 'failed']
        ]
      })
    }).toThrow('wrong service name: ')
  })

  it('should reject step with wrong flow name', () => {
    const steps = [
      {
        serviceName: 'service',
        flowName: 'flow-boom',
        stepName: 'step1',
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step2',
        follow: {step: 'step1', case: 'ok'},
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step3',
        follow: [
          {step: 'step1', case: 'failed'},
          {step: 'step2', case: 'failed'}
        ]
      }
    ]
    expect(() => {
      checkFlow(steps, {
        serviceName: 'service',
        flowName: 'flow',
        entries: ['step1'],
        follows: [
          ['step2', 'step1', 'ok'],
          ['step3', 'step1', 'failed'],
          ['step3', 'step2', 'failed']
        ]
      })
    }).toThrow('wrong flow name: ')
  })

  it('should reject duplicate steps', () => {
    const steps = [
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step1',
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step1',
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step2',
        follow: {step: 'step1', case: 'ok'},
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step3',
        follow: [
          {step: 'step1', case: 'failed'},
          {step: 'step2', case: 'failed'}
        ]
      }
    ]
    expect(() => {
      checkFlow(steps, {
        serviceName: 'service',
        flowName: 'flow',
        entries: ['step1'],
        follows: [
          ['step2', 'step1', 'ok'],
          ['step3', 'step1', 'failed'],
          ['step3', 'step2', 'failed']
        ]
      })
    }).toThrow('found duplicate steps: ')
  })

  it('should reject wrong entries', () => {
    const steps = [
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step1',
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step2',
        follow: {step: 'step1', case: 'ok'},
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step3',
        follow: [
          {step: 'step1', case: 'failed'},
          {step: 'step2', case: 'failed'}
        ]
      }
    ]
    expect(() => {
      checkFlow(steps, {
        serviceName: 'service',
        flowName: 'flow',
        entries: ['step1', 'step?'],
        follows: [
          ['step2', 'step1', 'ok'],
          ['step3', 'step1', 'failed'],
          ['step3', 'step2', 'failed']
        ]
      })
    }).toThrow('cannot find entry step: ')
    expect(() => {
      checkFlow(steps, {
        serviceName: 'service',
        flowName: 'flow',
        entries: ['step1', 'step2'],
        follows: [
          ['step2', 'step1', 'ok'],
          ['step3', 'step1', 'failed'],
          ['step3', 'step2', 'failed']
        ]
      })
    }).toThrow('step is not entry: ')
  })

  it('should reject wrong follows', () => {
    const steps = [
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step1',
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step2',
        follow: {step: 'step1', case: 'ok'},
        emitCases: {ok: 'ok'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step3',
        follow: [
          {step: 'step1', case: 'failed'},
          {step: 'step2', case: 'failed'}
        ]
      }
    ]
    expect(() => {
      checkFlow(steps, {
        serviceName: 'service',
        flowName: 'flow',
        entries: ['step1'],
        follows: [
          ['step?', 'step1', 'ok']
        ]
      })
    }).toThrow('cannot find following step: ')
    expect(() => {
      checkFlow(steps, {
        serviceName: 'service',
        flowName: 'flow',
        entries: ['step1'],
        follows: [
          ['step2', 'step?', 'ok']
        ]
      })
    }).toThrow('cannot find followed step: ')
    expect(() => {
      checkFlow(steps, {
        serviceName: 'service',
        flowName: 'flow',
        entries: ['step1'],
        follows: [
          ['step3', 'step2', 'failed']
        ]
      })
    }).toThrow('followed step does not emit this case: ')
    expect(() => {
      checkFlow(steps, {
        serviceName: 'service',
        flowName: 'flow',
        entries: ['step1'],
        follows: [
          ['step2', 'step1', 'failed'],
        ]
      })
    }).toThrow('cannot find this follow relation: ')
  })

  it('should reject if some entry step is not checked', () => {
    const steps = [
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step1',
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step2',
        follow: {step: 'step1', case: 'ok'},
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step3',
        follow: [
          {step: 'step1', case: 'failed'},
          {step: 'step2', case: 'failed'}
        ]
      }
    ]
    expect(() => {
      checkFlow(steps, {
        serviceName: 'service',
        flowName: 'flow',
        entries: [],
        follows: [
          ['step2', 'step1', 'ok'],
          ['step3', 'step1', 'failed'],
          ['step3', 'step2', 'failed']
        ]
      })
    }).toThrow('some entry step is not checked: ')
  })

  it('should reject if some follow relation is not checked', () => {
    const steps = [
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step1',
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step2',
        follow: {step: 'step1', case: 'ok'},
        emitCases: {ok: 'ok', failed: 'failed'}
      },
      {
        serviceName: 'service',
        flowName: 'flow',
        stepName: 'step3',
        follow: [
          {step: 'step1', case: 'failed'},
          {step: 'step2', case: 'failed'}
        ]
      }
    ]
    expect(() => {
      checkFlow(steps, {
        serviceName: 'service',
        flowName: 'flow',
        entries: ['step1'],
        follows: [
          ['step3', 'step1', 'failed'],
          ['step3', 'step2', 'failed']
        ]
      })
    }).toThrow('some follow relation is not checked: ')
  })
})