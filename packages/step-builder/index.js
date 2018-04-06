/*
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  serviceName?: String,
  flowName: String,
  stepName: String,
  follow?: FollowOptions | FollowOptions[],
  validator?: (data) => data, // if follow.$.validator is not provided, this validator will be used
  emitCases: {name: String => case: String}
  handler: Handler
}

FollowOptions ~ {
  step: String,
  case: String,
  validator?: (data) => data
}

Handler ~ (data, message, receivedTopic): HandlerThis => Promise => Void

HandlerThis ~ {
  // corresponding to emitCases
  emit: {
    name: String => (case, data?) => messageId
  }
}
 */

const ensureArray = require('ensure-array')
const mapValues = require('lodash.mapvalues')

module.exports = function (options) {
  const {
    natsEx,
    serviceName,
    flowName,
    stepName,
    follow,
    validator,
    emitCases,
    handler,
  } = options

  const fullName = ['flow', serviceName, flowName, stepName].filter(x => !!x).join('.')

  const defs = follow
    ? ensureArray(follow).map(follow => [
      ['flow', serviceName, flowName, follow.step, follow.case].filter(x => !!x).join('.'),
      follow.validator || validator
    ])
    : [[fullName, validator]]

  defs.forEach(([topic, validator]) => {
    const wrapperHandler = async (data, message, receivedTopic) => {
      const handlerThis = {
        emit: mapValues(emitCases, (_case) => (data) => message.emit(`${fullName}.${_case}`, data))
      }
      data = validator ? validator(data) : data
      await handler.call(handlerThis, data, message, receivedTopic)
    }
    natsEx.on(topic, wrapperHandler, {queue: fullName})
  })
}
