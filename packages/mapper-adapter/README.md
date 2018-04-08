# N3H Mapper Adapter

Adapt mapper messager item definition into standard item definition.

## Conventions for Mapper

- each mapper has such a full name: `mapper.$serviceName.$mapperName`
- it can map some message of in-topic into out-topic
- it can change message data while mapping
- each mapper uses its full name as queue group name

## API

[Documentation](./api.md)

## License

MIT