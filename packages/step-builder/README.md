# N3H Step Builder

Help build flow step messager.

## Conventions for Flow Step

- each step has such a full name: `flow.$serviceName.$flowName.$stepName`
- for the entry step, subscribe the topic of its full name
- for other steps, subscribe the message of some step it follows
- for all subscriptions, use its full name as queue group name
- a step may emit different messages based on its inner logic. the pattern of the topics of these message is `$fullName.$case`

## API

### buildStep

```
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  serviceName?: String,
  flowName: String,
  stepName: String,
  follow?: FollowOptions | FollowOptions[],
  validator?: (data) => data, // if follow.$.validator is not provided, this validator will be used
  emitCases: {name: String => case: String}
  handler: Handler
}

FollowOptions ~ {
  step: String,
  case: String,
  validator?: (data) => data
}

Handler ~ (data, message, receivedTopic): HandlerThis => Promise => Void

HandlerThis ~ {
  // corresponding to emitCases
  emit: {
    name: String => (case, data?) => messageId
  }
}
```

## License

MIT