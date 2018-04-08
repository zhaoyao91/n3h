# N3H Reactor Adapter

Adapt reactor messager item definition into standard item definition.

## Conventions for Reactor

- each action has such a full name: `reactor.$serviceName.$reactorName`
- it can listen to any kind of topic
- each reactor uses its full name as queue group name
- reactor could emit side effect messages with the topic pattern `$fullName.$case`

## API

[Documentation](./api.md)

## License

MIT