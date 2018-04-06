# N3H Action Adapter

Adapt action messager item definition into standard item definition.

## Conventions for Action

- each action has such a full name: `action.$serviceName.$actionName`
- the topic of its full name trigger the action
- each action uses its full name as queue group name
- action could return any result
- action could emit side effect messages with the topic pattern `$fullName.$case`

## API

[Documentation](./api.md)

## License

MIT