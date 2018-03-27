const Joi = require('joi')
const defaults = require('lodash.defaults')

function buildValidator (schema, options) {
  options = defaults(options, {
    allowUnknown: true,
    presence: 'required'
  })
  const compiledSchema = Joi.compile(schema)
  return function validator (data) {
    const {error, value} = compiledSchema.validate(data, options)
    if (error) throw error
    else return value
  }
}

module.exports = buildValidator