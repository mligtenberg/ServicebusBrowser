import { ServiceBusConnection } from './service-bus-connection';
import { RabbitMqConnection } from './rabbit-mq-connection';
import { EventHubConnection } from './event-hub-connection';

export * from './connection-base';
export * from './service-bus-connection';
export * from './rabbit-mq-connection';
export * from './event-hub-connection';

export type Connection = ServiceBusConnection | RabbitMqConnection | EventHubConnection;
