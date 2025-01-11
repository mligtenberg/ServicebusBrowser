import { ConnectionManager } from '@service-bus-browser/service-bus-clients';

export class Server {
  constructor(private connectionManager: ConnectionManager) {}

  async managementExecute(actionName: string, requestBody: unknown) {
    const module = require(`./lib/service-bus-server`);
    const func = module.management[actionName];

    if (func && typeof func === 'function') {
      const result = func(requestBody, this.connectionManager);

      // if is a promise, wait for it to resolve
      if (result instanceof Promise) {
        return await result;
      }

      return result;
    }

    throw new Error(`Action ${actionName} not found`);
  }

  async messagesExecute(actionName: string, requestBody: unknown) {
    const module = require(`./lib/service-bus-server`);
    const func = module.messages[actionName];

    if (func && typeof func === 'function') {
      const result = func(requestBody, this.connectionManager);

      // if is a promise, wait for it to resolve
      if (result instanceof Promise) {
        return await result;
      }

      return result;
    }

    throw new Error(`Action ${actionName} not found`);
  }
}
