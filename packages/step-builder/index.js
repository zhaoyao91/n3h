/*
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  serviceName?: String,
  flowName: String,
  stepName: String,
  follow?: {
    step: String,
    case: String,
  },
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
    serviceName,
    flowName,
    stepName,
    follow,
    validator,
    handler,
  } = options

  const fullName = ['flow', serviceName, flowName, stepName].filter(x => !!x).join('.')

  const topic = follow
    ? ['flow', serviceName, flowName, follow.step, follow.case].filter(x => !!x).join('.')
    : fullName

  const wrapperHandler = async (data, message, receivedTopic) => {
    const handlerThis = {
      emit: {
        ok: (data) => message.emit(`${fullName}.ok`, data),
        okCase: (_case, data) => message.emit(`${fullName}.ok.${_case}`, data),
        failed: (data) => message.emit(`${fullName}.failed`, data),
        failedCase: (_case, data) => message.emit(`${fullName}.failed.${_case}`, data),
      }
    }
    data = validator ? validator(data) : data
    await handler.call(handlerThis, data, message, receivedTopic)
  }

  natsEx.on(topic, wrapperHandler, {queue: fullName})
}
