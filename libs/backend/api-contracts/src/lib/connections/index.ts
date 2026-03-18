import { ServiceBusConnection } from './service-bus-connection';
import { RabbitMqConnection } from './rabbit-mq-connection';

export * from './connection-base';
export * from './connection-base';
export * from './service-bus-connection';
export * from './rabbit-mq-connection';

export type Connection = ServiceBusConnection | RabbitMqConnection;
