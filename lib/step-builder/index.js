/*
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  flowName: String,
  stepName: String,
  followStep?: String,
  validator?: (data) => data,
  handler: (Emitter, data, message, receivedTopic) => Promise => Void
}

Emitter ~ {
  ok: (data?) => messageId,
  okCase: (case: String, data?) => messageId,
  failed: (data?) => messageId,
  failedCase: (case: String, data?) => messageId,
}
 */
module.exports = function (options) {
  const {
    natsEx,
    flowName,
    stepName,
    followStep,
    validator,
    handler,
  } = options

  const name = `flow.${flowName}.${stepName}`

  const topic = followStep
    ? `flow.${flowName}.${followStep}`
    : name

  const wrapperHandler = async (data, message, receivedTopic) => {
    const emitter = {
      ok: (data) => message.emit(`${name}.ok`, data),
      okCase: (_case, data) => message.emit(`${name}.ok.${_case}`, data),
      failed: (data) => message.emit(`${name}.failed`, data),
      failedCase: (_case, data) => message.emit(`${name}.failed.${_case}`, data),
    }
    try {
      // validate data here instead of relying on natsEx to catch the validation error
      data = validator ? validator(data) : data
      await handler(emitter, data, message, receivedTopic)
    }
    catch (err) {
      message.emit(`${name}.error`, data)
      throw err
    }
  }

  natsEx.on(topic, wrapperHandler, {queue: name})
}
