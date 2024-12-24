import { Connection } from '@service-bus-browser/service-bus-contracts';

interface ElectronWindow {
  serviceBusApi: {
    doRequest: (requestType: string, request: unknown) => Promise<unknown>;
  };
}

const typelessWindow = window as unknown;
const { serviceBusApi } = typelessWindow as ElectronWindow;

export class ServiceBusElectronClient {
  async addConnection(connection: Connection): Promise<void> {
    await serviceBusApi.doRequest('addConnection', connection);
  }

  async listConnections(): Promise<string[]> {
    await serviceBusApi.doRequest('listConnections', {});
    return [];
  }
}
