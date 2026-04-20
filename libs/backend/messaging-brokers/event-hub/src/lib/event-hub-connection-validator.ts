import {
  ConnectionValidator,
  EventHubConnection,
} from '@service-bus-browser/api-contracts';
import { getCredential } from './internal/credential-helper';
import { listEventHubs, getEventHubInfo } from './internal/namespace-rest-client';
import { getEntityPathFromConnectionString } from './internal/credential-helper';

export class EventHubConnectionValidator implements ConnectionValidator {
  constructor(private readonly connection: EventHubConnection) {}

  async validateConnection(): Promise<boolean> {
    try {
      const credential = getCredential(this.connection);

      if (
        this.connection.type === 'connectionString' &&
        getEntityPathFromConnectionString(this.connection.connectionString)
      ) {
        const entityPath = getEntityPathFromConnectionString(this.connection.connectionString)!;
        await getEventHubInfo(credential, entityPath);
      } else {
        await listEventHubs(credential);
      }

      return true;
    } catch (e) {
      return false;
    }
  }
}
