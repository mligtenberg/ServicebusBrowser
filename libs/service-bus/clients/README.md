# @service-bus-browser/service-bus-clients

Wrapper classes around the Azure Service Bus SDK.

## Running unit tests

Run `nx test @service-bus-browser/service-bus-clients` to execute the unit tests.

## Usage
Create a `ConnectionManager` and send a message:
```ts
const manager = new ConnectionManager(connectionStore);
const client = manager.getConnectionClient({ id: 'dev' });
const sender = client.getMessageSendClient({ queueName: 'my-queue' });
await sender.send({ body: 'hello world' });
```
