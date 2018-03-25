/*
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  name,
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
    name,
    validator,
    handler,
  } = options

  const fullName = `action.${name}`

  const wrapperHandler = async (data, message, receivedTopic) => {
    const handlerThis = {
      emit: (_case, data) => message.emit(`${fullName}.${_case}`, data)
    }
    data = validator ? validator(data) : data
    return handler.call(handlerThis, data, message, receivedTopic)
  }

  natsEx.on(fullName, wrapperHandler, {queue: fullName})
}
