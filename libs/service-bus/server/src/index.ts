import { ConnectionManager } from '@service-bus-browser/service-bus-clients';
import { management, messages } from './lib/service-bus-server';

export class Server {
  constructor(private connectionManager: ConnectionManager) {}

  managementExecute(actionName: string, requestBody: unknown) {
    if (management.has(actionName)) {
      const func = management.get(actionName);
      return func?.(requestBody, this.connectionManager) ?? Promise.reject('Action returned undefined');
    }

    throw new Error(`Action ${actionName} not found`);
  }

  messagesExecute(actionName: string, requestBody: unknown) {
    if (messages.has(actionName)) {
      const func = messages.get(actionName);
      return func?.(requestBody, this.connectionManager) ?? Promise.reject("Action returned undefined");
    }

    throw new Error(`Action ${actionName} not found`);
  }
}
