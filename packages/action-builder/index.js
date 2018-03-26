/*
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  serviceName?: String,
  actionName: String,
  validator?: (data) => data,
  handler: Handler
}

Handler ~ (data, message, receivedTopic): HandlerThis => Promise => Any

HandlerThis ~ {
  emit: (case, data?) => messageId
}
 */
module.exports = function (options) {
  const {
    natsEx,
    serviceName,
    actionName,
    validator,
    handler,
  } = options

  const fullName = ['action', serviceName, actionName].filter(x => !!x).join('.')

  const wrapperHandler = async (data, message, receivedTopic) => {
    const handlerThis = {
      emit: (_case, data) => message.emit(`${fullName}.${_case}`, data)
    }
    data = validator ? validator(data) : data
    return handler.call(handlerThis, data, message, receivedTopic)
  }

  natsEx.on(fullName, wrapperHandler, {queue: fullName})
}
