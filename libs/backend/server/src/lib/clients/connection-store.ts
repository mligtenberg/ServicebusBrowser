import { Connection } from '@service-bus-browser/api-contracts';
import { UUID } from '@service-bus-browser/shared-contracts';

export interface ConnectionStore {
  /**
   * When true the store does not allow mutating connections (add/rename/remove).
   * Used to hide connection-mutation actions from the UI. Defaults to false.
   */
  isReadonly?: boolean;
  addConnection(connection: Connection): void;
  renameConnection(connectionId: UUID, name: string, workspaceId?: UUID): void;
  removeConnection(connectionId: UUID, workspaceId?: UUID): void;
  listConnections(workspaceId: UUID): Array<{
    connectionId: UUID;
    connectionName: string;
  }>;
  getConnection(connectionId: UUID): Connection | undefined;
}
