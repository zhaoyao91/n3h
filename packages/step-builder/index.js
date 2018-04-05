/*
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  serviceName?: String,
  flowName: String,
  stepName: String,
  follow?: FollowOptions | FollowOptions[],
  validator?: (data) => data, // if follow.$.validator is not provided, this validator will be used
  handler: Handler
}

FollowOptions ~ {
  step: String,
  case: String,
  validator?: (data) => data
}

Handler ~ (data, message, receivedTopic): HandlerThis => Promise => Void

HandlerThis ~ {
  emit: (case, data?) => messageId
}
 */

const ensureArray = require('ensure-array')

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

  const defs = follow
    ? ensureArray(follow).map(follow => [
      ['flow', serviceName, flowName, follow.step, follow.case].filter(x => !!x).join('.'),
      follow.validator || validator
    ])
    : [[fullName, validator]]

  defs.forEach(([topic, validator]) => {
    const wrapperHandler = async (data, message, receivedTopic) => {
      const handlerThis = {
        emit: Object.assign(
          (_case, data) => message.emit(`${fullName}.${_case}`, data),
          /**
           * @deprecated
           */
          {
            ok: (data) => message.emit(`${fullName}.ok`, data),
            okCase: (_case, data) => message.emit(`${fullName}.ok.${_case}`, data),
            failed: (data) => message.emit(`${fullName}.failed`, data),
            failedCase: (_case, data) => message.emit(`${fullName}.failed.${_case}`, data),
          })
      }
      data = validator ? validator(data) : data
      await handler.call(handlerThis, data, message, receivedTopic)
    }
    natsEx.on(topic, wrapperHandler, {queue: fullName})
  })
}
