import {
  ConnectionValidator,
  RabbitMqConnection,
} from '@service-bus-browser/api-contracts';
import { Connection } from 'rhea-promise';
import { getConnectionOptions } from './internal/rabbitmq-connection-options';
import { RabbitMqManagementClient } from './rabbitmq-management-client';

export class RabbitMqConnectionValidator implements ConnectionValidator {
  constructor(private readonly connection: RabbitMqConnection) {}

  async validateConnection(): Promise<boolean> {
    const managementClient = new RabbitMqManagementClient(this.connection);
    if (await managementClient.checkConnection()) {
      return true;
    }

    const client = new Connection(getConnectionOptions(this.connection));
    try {
      await client.open();
      return true;
    } catch {
      return false;
    } finally {
      await client.close().catch(() => undefined);
    }
  }
}
