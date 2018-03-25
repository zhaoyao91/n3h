/*
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  name,
  validator?: (data) => data,
  handler: (Emitter, data, message, receivedTopic) => Promise => Any
}

Emitter ~ (effect, data?) => messageId
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
    const emitter = (effect, data) => message.emit(`${fullName}.${effect}`, data)
    try {
      // validate data here instead of relying on natsEx to catch the validation error
      data = validator ? validator(data) : data
      return await handler(emitter, data, message, receivedTopic)
    }
    catch (err) {
      message.emit(`${fullName}.error`, data)
      throw err
    }
  }

  natsEx.on(fullName, wrapperHandler, {queue: fullName})
}
