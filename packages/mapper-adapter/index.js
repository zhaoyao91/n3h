/**
 * @external external:StandardItemDefinition
 * @see {@link https://github.com/zhaoyao91/the-holder/blob/master/api.md#Holder..StandardItemDefinition | StandardItemDefinition}
 */

/**
 * @typedef {function} adapt~DataMapper
 * @async
 * @param {any} data
 * @return {Promise.<any>}
 */

/**
 * the final definition for this item
 * @typedef {object} adapt~DataMapper#definition
 */

/**
 * items built before this item
 * @typedef {object} adapt~DataMapper#items
 */

/**
 * @param {object} definition
 * @param {string} definition.serviceName
 * @param {string} definition.mapperName
 * @param {function} [definition.validator] - (data) => data, or throw validation error
 * @param {string} definition.inTopic
 * @param {string} definition.outTopic
 * @param {adapt~DataMapper} [definition.mapData]
 * @return {external:StandardItemDefinition}
 */
function adapt (definition) {
  const {
    serviceName,
    mapperName,
    inTopic,
    outTopic,
    validator,
    mapData = id,
  } = definition

  return {
    ...definition,
    build: (items, definition) => {
      const {natsEx} = items // yes, natsEx is required
      const fullName = ['mapper', serviceName, mapperName].filter(x => !!x).join('.')
      const wrapperHandler = async (data, message, receivedTopic) => {
        const handlerThis = {
          definition: definition,
          items: items,
        }
        data = validator ? validator(data) : data
        data = await mapData.call(handlerThis, data)
        message.emit(outTopic, data)
      }

      natsEx.on(inTopic, wrapperHandler, {queue: fullName})
    }
  }
}

module.exports = adapt

function id (x) {return x}