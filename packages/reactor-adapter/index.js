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
 * @typedef {string | object} adapt~onOption
 * @property {string} topic
 * @property {function} [validator] - the same as validator in definition
 */

const mapValues = require('lodash.mapvalues')
const {inspect} = require('util')

/**
 * @param {object} definition
 * @param {string} definition.serviceName
 * @param {string} definition.reactorName
 * @param {adapt~onOption | adapt~onOption[]} definition.on - define what message to listen
 * @param {function} [definition.validator] - (data) => data, or throw validation error
 * @param {adapt~Handler} definition.handler
 * @param {object} [definition.emitCases] - key is case in js, value is case in message topic
 * @param {function} [definition.mapItems] - (items) => items
 * @return {external:StandardItemDefinition}
 */
function adapt (definition) {
  const {
    serviceName,
    reactorName,
    on,
    validator,
    handler,
    emitCases,
  } = definition

  return {
    ...definition,
    build: (items, definition) => {
      const {natsEx} = items // yes, natsEx is required
      const fullName = ['reactor', serviceName, reactorName].filter(x => !!x).join('.')

      adaptOn(on).forEach(x => {
        const wrapperHandler = async (data, message, receivedTopic) => {
          const handlerThis = {
            definition: definition,
            items: items,
            emit: mapValues(emitCases, (_case) => (data) => message.emit(`${fullName}.${_case}`, data))
          }
          data = x.validator
            ? x.validator(data)
            : validator
              ? validator(data)
              : data
          return handler.call(handlerThis, data, message, receivedTopic)
        }

        natsEx.on(x.topic, wrapperHandler, {queue: fullName})
      })
    }
  }
}

module.exports = adapt

function adaptOn (on) {
  if (typeof on === 'string') return [{topic: on}]
  else if (Array.isArray(on)) return on.map(x => typeof x === 'string' ? {topic: x} : x)
  else if (typeof on === 'object') return [on]
  throw new TypeError(`invalid on option: ${inspect(on)}`)
}