# N3H Action Builder

Help build action messager.

## Conventions for Action

- each action has a name prefixed with 'action', such as `action.$action`
- the topic of its name trigger the action
- each action uses its name as queue group name
- action could return any result
- action could emit side effect messages with the topic pattern `$name.$case`

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