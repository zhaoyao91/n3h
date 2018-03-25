# N3H Step Builder

Help build action messager.

## Conventions for Action

- each action has a name prefixed with 'action', such as `action.$action`
- the topic of its name trigger the action
- each action uses its name as queue group name
- action could return any result
- action could emit side effect messages with the topic pattern `$name.$effect`
- if an action throws any unhandled error
  - it will try to return the error back to the caller
  - it will try to emit an error message to the system with topic `$name.error` with the input data (well, this is 
  actually a default side effect for all actions) 

## API

### buildAction

```
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  name,
  validator?: (data) => data,
  handler: Handler
}

Handler ~ (data, message, receivedTopic): HandlerThis => Promise => Any

HandlerThis ~ {
  emit: (case, data?) => messageId
}
```