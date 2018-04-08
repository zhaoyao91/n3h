/**
 * @external external:StandardItemDefinition
 * @see {@link https://github.com/zhaoyao91/the-holder/blob/master/api.md#Holder..StandardItemDefinition | StandardItemDefinition}
 */

/**
 * @external external:NatsExHandler
 * @see {@link https://github.com/zhaoyao91/nats-ex/blob/master/packages/nats-ex/docs/api.md#on | NatsExHandler}
 */

/**
 * The same as natsEx handler, but with some extra fields in function this
 * @typedef {external:NatsExHandler} adapt~Handler
 */

/**
 * the final definition for this item
 * @typedef {object} adapt~Handler#definition
 */

/**
 * items built before this item
 * @typedef {object} adapt~Handler#items
 */

/**
 * side effect message emit helper.
 * corresponding to emitCases option in definition.
 * each value is a function of: (data) => messageId
 * @typedef {object} adapt~Handler#emit
 */

/**
 * @typedef {object} adapt~followOptions
 * @property {string} step
 * @property {string} case
 * @property {function} [validator] - the same as validator in definition
 */

const ensureArray = require('ensure-array')
const mapValues = require('lodash.mapvalues')

/**
 * @param {object} definition
 * @param {string} definition.serviceName
 * @param {string} definition.flowName
 * @param {string} definition.stepName
 * @param {adapt~followOptions | adapt~followOptions[]} definition.follow
 * @param {function} [definition.validator] - (data) => data, or throw validation error
 * @param {adapt~Handler} definition.handler
 * @param {object} [definition.emitCases] - key is case in js, value is case in message topic
 * @return {external:StandardItemDefinition}
 */
function adapt(definition) {
  const {
    serviceName,
    flowName,
    stepName,
    follow,
    validator,
    emitCases,
    handler,
  } = definition

  return {
    ...definition,
    build: (items, definition) => {
      const {natsEx} = items // yes, natsEx is required

      const fullName = ['step', serviceName, flowName, stepName].filter(x => !!x).join('.')

      const defs = follow
        ? ensureArray(follow).map(follow => [
          ['step', serviceName, flowName, follow.step, follow.case].filter(x => !!x).join('.'),
          follow.validator || validator
        ])
        : [[fullName, validator]]

      defs.forEach(([topic, validator]) => {
        const wrapperHandler = async (data, message, receivedTopic) => {
          const handlerThis = {
            definition: definition,
            items: items,
            emit: mapValues(emitCases, (_case) => (data) => message.emit(`${fullName}.${_case}`, data))
          }
          data = validator ? validator(data) : data
          await handler.call(handlerThis, data, message, receivedTopic)
        }
        natsEx.on(topic, wrapperHandler, {queue: fullName})
      })
    }
  }
}

module.exports = adapt