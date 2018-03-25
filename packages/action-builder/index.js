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
    try {
      // validate data here instead of relying on natsEx to catch the validation error
      data = validator ? validator(data) : data
      return await handler.call(handlerThis, data, message, receivedTopic)
    }
    catch (err) {
      message.emit(`${fullName}.error`, data)
      throw err
    }
  }

  natsEx.on(fullName, wrapperHandler, {queue: fullName})
}
