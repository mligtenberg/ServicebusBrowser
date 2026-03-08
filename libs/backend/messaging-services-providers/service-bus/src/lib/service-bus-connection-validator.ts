import {
  Connection,
  ConnectionValidator,
} from '@service-bus-browser/api-contracts';
import { ServiceBusManagementClient } from './service-bus-management-client';

export class ServiceBusConnectionValidator implements ConnectionValidator {
  constructor(private readonly connection: Connection) {}
  async validateConnection(): Promise<boolean> {
    const administrationClient = new ServiceBusManagementClient(
      this.connection,
    );
    return administrationClient.checkConnection();
  }
}
