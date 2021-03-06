/*
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  name,
  inTopic,
  outTopic,
  validator?: (data) => data,
  mapData?: (data, message, receivedTopic) => Promise => data,
}
 */
module.exports = function (options) {
  const {
    natsEx,
    name,
    inTopic,
    outTopic,
    validator,
    mapData = id,
  } = options

  const fullName = `mapper.${name}`

  const wrapperHandler = async (data, message, receivedTopic) => {
    data = validator ? validator(data) : data
    const result = await mapData(data, message, receivedTopic)
    message.emit(outTopic, result)
  }

  natsEx.on(inTopic, wrapperHandler, {queue: fullName})
}

function id (x) {return x}