import { ConnectionBase } from './connection-base';

export interface RabbitMqConnection extends ConnectionBase {
  type: 'connectionString';
  host: string;
  managementPort: number;
  amqpPort: number;
  vhost?: string;
  userName: string;
  password: string;
  target: 'rabbitmq';
}
