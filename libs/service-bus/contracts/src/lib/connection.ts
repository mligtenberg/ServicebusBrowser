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

export interface AzureCliAuthConnection extends AzureADConnection {
  authMethod: 'azureCli';
}

export interface AzureServicePrincipalConnection extends AzureADConnection {
  authMethod: 'ServicePrincipalClientSecret';
  clientId: string;
  clientSecret: string;
  tenantId: string;
  authority: string;
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
  AzureCliAuthConnection |
  AzureServicePrincipalConnection |
  SystemAssignedManagedIdentityConnection |
  UserAssignedManagedIdentityConnection;
