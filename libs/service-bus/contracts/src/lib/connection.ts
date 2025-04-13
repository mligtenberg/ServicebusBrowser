import { UUID } from '@service-bus-browser/shared-contracts';

interface ConnectionBase {
  id: UUID;
  type: string;
  name: string;
}

export interface ConnectionStringConnection extends ConnectionBase {
  type: 'connectionString';
  connectionString: string;
}

export interface AzureADConnection extends ConnectionBase {
  type: 'azureAD';
  fullyQualifiedNamespace: string;
}

export type Connection = ConnectionStringConnection | AzureADConnection;
