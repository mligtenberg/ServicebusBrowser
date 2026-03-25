import { RabbitMqManagementClient } from '@service-bus-browser/rabbitmq-backend-clients';
import { ConnectionManager } from '../clients/connection-manager';
import { UUID } from '@service-bus-browser/shared-contracts';

export function getRabbitMqManagementClient(
  connectionId: UUID,
  connectionManager: ConnectionManager,
): RabbitMqManagementClient {
  const connection = connectionManager.getConnection({ id: connectionId });

  if (!connection) {
    throw new Error('Connection not found');
  }

  if (connection.target !== 'rabbitmq') {
    throw new Error('Connection is not targeting RabbitMQ');
  }

  return new RabbitMqManagementClient(connection);
}
