import { Connection } from '@service-bus-browser/message-queue-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';

export interface ConnectionStore {
  addConnection(connection: Connection): void;
  removeConnection(connectionId: UUID): void;
  listConnections(): Array<{ connectionId: UUID; connectionName: string }>;
  getConnection(connectionId: UUID): Connection | undefined;
}
