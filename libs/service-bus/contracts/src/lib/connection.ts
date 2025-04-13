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
  authMethod: 'currentUser' | 'systemAssignedManagedIdentity' | 'userAssignedManagedIdentity';
}

export interface AzureBrowserAuthConnection extends AzureADConnection {
  authMethod: 'currentUser';
  email: string;
}

export interface SystemAssignedManagedIdentityConnection extends AzureADConnection {
  authMethod: 'systemAssignedManagedIdentity';
}

export interface UserAssignedManagedIdentityConnection extends AzureADConnection {
  authMethod: 'userAssignedManagedIdentity';
  clientId: string;
}

export type Connection = 
ConnectionStringConnection |
AzureBrowserAuthConnection |
SystemAssignedManagedIdentityConnection |
UserAssignedManagedIdentityConnection;
