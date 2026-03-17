import { ServiceBusManagementClient } from '@service-bus-browser/service-bus-backend-clients';
import { ConnectionManager } from '../clients/connection-manager';
import { UUID } from '@service-bus-browser/shared-contracts';

export function getManagementClient(
  connectionId: UUID,
  connectionManager: ConnectionManager,
) {
  const connection = connectionManager.getConnection({
    id: connectionId,
  });

  if (!connection) {
    throw new Error('Connection not found');
  }

  if (connection.target !== 'serviceBus') {
    throw new Error('Connection not targeting service bus');
  }

  return new ServiceBusManagementClient(connection);
}
