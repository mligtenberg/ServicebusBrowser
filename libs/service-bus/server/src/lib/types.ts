import { ConnectionManager } from '@service-bus-browser/service-bus-clients';

export type ServiceBusServerFunc = (
  body: any,
  connectionManager: ConnectionManager,
) => Promise<any>;
