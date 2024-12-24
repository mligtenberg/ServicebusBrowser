import { Connection } from '@service-bus-browser/service-bus-contracts';
import { AdministrationClient } from './administration-client';

export class ConnectionClient {
  constructor(private connection: Connection) {}

  getAdministrationClient() {
    return new AdministrationClient(this.connection);
  }
}
