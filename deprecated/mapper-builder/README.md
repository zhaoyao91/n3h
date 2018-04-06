# N3H Mapper Builder

Help build mapper messager.

## Deprecation

This package is only for `the-holder v1`, so it's deprecated now.

## Conventions for Mapper

- each mapper has a name prefixed with 'mapper', such as `mapper.$mapper`
- each mapper uses its name as queue group name
- it maps one message to another

## API

```
(Options) => Void

Options ~ {
  natsEx: NatsEx,
  name,
  inTopic,
  outTopic,
  validator?: (data) => data,
  mapData?: (data, message, receivedTopic) => Promise => data,
}
```

## License

MIT