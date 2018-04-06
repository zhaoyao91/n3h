# N3H Action Builder

Help build action messager.

## Deprecation

This package is only for `the-holder v1`, so it's deprecated now.

## Conventions for Action

- each action has such a full name: `action.$serviceName.$actionName`
- the topic of its full name trigger the action
- each action uses its full name as queue group name
- action could return any result
- action could emit side effect messages with the topic pattern `$fullName.$case`

## API

### buildAction

```
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  serviceName?: String,
  actionName: String,
  validator?: (data) => data,
  handler: Handler
}

Handler ~ (data, message, receivedTopic): HandlerThis => Promise => Any

HandlerThis ~ {
  emit: (case, data?) => messageId
}
```

## License

MIT