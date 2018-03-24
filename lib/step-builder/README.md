# N3H Step Builder

Help build flow step messager.

## Conventions for Flow Step

- each step has a name prefixed with 'flow' and flow name, such as `flow.$flow.$step`
- for the entry step, subscribe the topic of its name
- for other steps, subscribe the topics it follows
- for all subscriptions, use its name as queue group name
- the topics a step emits are classified into 3 categories:
  - `$name.ok(.*)?` - for succeeded business logic
  - `$name.failed(.*)?` - failed - for known failed business logic
  - `$name.error` - for failed business logic which are caused by unknown errors
  
## API

### buildStep

```
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  flowName: String,
  stepName: String,
  followStep?: String,
  validator?: (data) => data,
  handler: (Emitter, data, message, receivedTopic) => Promise => Void
}

Emitter ~ {
  ok: (data?) => Void,
  okCase: (case: String, data?) => Void,
  failed: (data?) => Void,
  failedCase: (case: String, data?) => Void,
}
```