# N3H Check Flow

Help check the correction of a flow.

## Installation

`npm install --save-dev n3h-check-flow`

## Usage

In your test file:

```javascript
const checkFlow = require('n3h-check-flow')

const stepDefinitions = ...

checkFlow(stepDefinitions, {
  serviceName: 'some-service',
  flowName: 'some-flow',
  entries: ['step1'],
  follows: [
    ['step2', 'step1', 'ok'],
    ['step3', 'step1', 'failed'],
    ['step3', 'step2', 'failed']
  ]
})
```

## API

[Documentation](./api.md)

## License

MIT