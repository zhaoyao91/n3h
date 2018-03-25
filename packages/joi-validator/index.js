const Joi = require('joi')

function buildValidator (schema, options) {
  const compiledSchema = Joi.compile(schema)
  return function validator (data) {
    const {error, value} = compiledSchema.validate(data, options)
    if (error) throw error
    else return value
  }
}

module.exports = buildValidator