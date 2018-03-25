# N3H Joi Validator

Validate N3H message data using [Joi](https://github.com/hapijs/joi).

## N3H Validator Schema

```
// if validation failed, throw an error
// if validation ok, the result is the original data or mapped data (generally, just resolve it to proper type)
(data) => data
```

## Installation

```
npm install joi
npm install n3h-joi-validator
```

## Usage

```
const Joi = require('joi')
const buildValidator = require('n3h-joi-validator')

const validator = buildValidator({
  name: Joi.string(),
  age: Joi.number().required(),
})
```

## License

MIT