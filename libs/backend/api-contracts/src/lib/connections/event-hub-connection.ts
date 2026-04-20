import { ConnectionBase } from './connection-base';

export interface EventHubConnectionStringConnection extends ConnectionBase {
  type: 'connectionString';
  connectionString: string;
  target: 'eventHub';
}

export interface EventHubAzureADConnection extends ConnectionBase {
  type: 'azureAD';
  fullyQualifiedNamespace: string;
  target: 'eventHub';
}

export interface EventHubAzureCliAuthConnection extends EventHubAzureADConnection {
  authMethod: 'azureCli';
}

export interface EventHubAzureServicePrincipalConnection extends EventHubAzureADConnection {
  authMethod: 'ServicePrincipalClientSecret';
  clientId: string;
  clientSecret: string;
  tenantId: string;
  authority: string;
}

export interface EventHubSystemAssignedManagedIdentityConnection extends EventHubAzureADConnection {
  authMethod: 'systemAssignedManagedIdentity';
}

export interface EventHubUserAssignedManagedIdentityConnection extends EventHubAzureADConnection {
  authMethod: 'userAssignedManagedIdentity';
  clientId: string;
}

export type EventHubConnection =
  | EventHubConnectionStringConnection
  | EventHubAzureCliAuthConnection
  | EventHubAzureServicePrincipalConnection
  | EventHubSystemAssignedManagedIdentityConnection
  | EventHubUserAssignedManagedIdentityConnection;
