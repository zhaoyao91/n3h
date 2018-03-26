# N3H Step Builder

Help build flow step messager.

## Conventions for Flow Step

- each step has such a full name: `flow.$serviceName.$flowName.$stepName`
- for the entry step, subscribe the topic of its full name
- for other steps, subscribe the message of some step it follows
- for all subscriptions, use its full name as queue group name
- the topics a step emits are classified into 2 categories:
  - `$fullName.ok(.*)?`
  - `$fullName.failed(.*)?`
  
## API

### buildStep

```
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  serviceName?: String,
  flowName: String,
  stepName: String,
  follow?: {
    step: String,
    case: String,
  },
  validator?: (data) => data,
  handler: Handler
}

Handler ~ (data, message, receivedTopic): HandlerThis => Promise => Void

HandlerThis ~ {
  emit: {
    ok: (data?) => messageId,
    okCase: (case: String, data?) => messageId,
    failed: (data?) => messageId,
    failedCase: (case: String, data?) => messageId,
  }
}
```

## License

MIT