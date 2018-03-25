# N3H Step Builder

Help build flow step messager.

## Conventions for Flow Step

- each step has a name prefixed with 'flow' and flow name, such as `flow.$flow.$step`
- for the entry step, subscribe the topic of its name
- for other steps, subscribe the topics it follows
- for all subscriptions, use its name as queue group name
- the topics a step emits are classified into 2 categories:
  - `$name.ok(.*)?`
  - `$name.failed(.*)?`
  
## API

### buildStep

```
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  flowName: String,
  stepName: String,
  follow?: String, // step message to follow, such as $otherStep.ok or $otherStep.failed,
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