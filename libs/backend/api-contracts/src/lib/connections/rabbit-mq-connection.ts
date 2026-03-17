import { ConnectionBase } from './connection-base';

export interface RabbitMqConnection extends ConnectionBase {
  type: 'connectionString';
  endpoint: string;
  userName: string;
  password: string;
  target: 'rabbitmq';
}
