import { ConnectionManager } from './clients/connection-manager';

export type ServiceBusServerFunc = (
  body: any,
  connectionManager: ConnectionManager,
) => Promise<any>;
