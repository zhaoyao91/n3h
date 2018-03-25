/*
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  flowName: String,
  stepName: String,
  followStep?: String,
  validator?: (data) => data,
  handler: Handler
}

Handler ~ (data, message, receivedTopic): HandlerThis => Promise => Void

HandlerThis ~ {
  emit: {
    ok: (data?) => messageId,
    okCase: (case: String, data?) => messageId,
    failed: (data?) => messageId,
    failedCase: (case: String, data?) => messageId,
  }
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
    const handlerThis = {
      emit: {
        ok: (data) => message.emit(`${name}.ok`, data),
        okCase: (_case, data) => message.emit(`${name}.ok.${_case}`, data),
        failed: (data) => message.emit(`${name}.failed`, data),
        failedCase: (_case, data) => message.emit(`${name}.failed.${_case}`, data),
      }
    }
    await handler.call(handlerThis, data, message, receivedTopic)
  }

  natsEx.on(topic, wrapperHandler, {
    queue: name,
    validator,
  })
}
