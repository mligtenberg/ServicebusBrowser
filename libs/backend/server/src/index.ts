import { ConnectionManager } from './lib/clients/connection-manager';
import messagesOperations from './lib/messages';
import managementOperations from './lib/management';
import serviceBusManagementOperations from './lib/service-bus-management';

import { ConnectionStore as _connectionStore } from './lib/clients/connection-store';
export type ConnectionStore = _connectionStore;

export class Server {
  private connectionManager: ConnectionManager;

  constructor(connectionStore: ConnectionStore) {
    this.connectionManager = new ConnectionManager(connectionStore);
  }

  managementExecute(actionName: string, requestBody: unknown) {
    if (managementOperations.has(actionName)) {
      const func = managementOperations.get(actionName);
      return (
        func?.(requestBody, this.connectionManager) ??
        Promise.reject('Action returned undefined')
      );
    }

    throw new Error(`Action ${actionName} not found`);
  }

  serviceBusManagementExecute(actionName: string, requestBody: unknown) {
    if (serviceBusManagementOperations.has(actionName)) {
      const func = serviceBusManagementOperations.get(actionName);
      return (
        func?.(requestBody, this.connectionManager) ??
        Promise.reject('Action returned undefined')
      );
    }

    throw new Error(`Action ${actionName} not found`);
  }

  messagesExecute(actionName: string, requestBody: unknown) {
    if (messagesOperations.has(actionName)) {
      const func = messagesOperations.get(actionName);
      return (
        func?.(requestBody, this.connectionManager) ??
        Promise.reject('Action returned undefined')
      );
    }

    throw new Error(`Action ${actionName} not found`);
  }
}
