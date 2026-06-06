import { ConnectionBase } from './connection-base';

export interface ServiceBusConnectionStringConnection extends ConnectionBase {
  type: 'connectionString';
  connectionString: string;
  target: 'serviceBus';
}

export interface ServiceBusAzureADConnection extends ConnectionBase {
  type: 'azureAD';
  fullyQualifiedNamespace: string;
  target: 'serviceBus';
}

export interface ServiceBusAzureCliAuthConnection
  extends ServiceBusAzureADConnection {
  authMethod: 'azureCli';
}

export interface ServiceBusAzureServicePrincipalConnection
  extends ServiceBusAzureADConnection {
  authMethod: 'ServicePrincipalClientSecret';
  clientId: string;
  clientSecret: string;
  tenantId: string;
  authority: string;
}

export interface ServiceBusSystemAssignedManagedIdentityConnection
  extends ServiceBusAzureADConnection {
  authMethod: 'systemAssignedManagedIdentity';
}

export interface ServiceBusUserAssignedManagedIdentityConnection
  extends ServiceBusAzureADConnection {
  authMethod: 'userAssignedManagedIdentity';
  clientId: string;
}

export interface ServiceBusIntegratedAuthConnection
  extends ServiceBusAzureADConnection {
  authMethod: 'integratedAuth';
  email: string;
  /** Optional directory (tenant) id. Required for guest (B2B) accounts. */
  tenantId?: string;
}

export type ServiceBusConnection =
  | ServiceBusConnectionStringConnection
  | ServiceBusAzureCliAuthConnection
  | ServiceBusAzureServicePrincipalConnection
  | ServiceBusSystemAssignedManagedIdentityConnection
  | ServiceBusUserAssignedManagedIdentityConnection
  | ServiceBusIntegratedAuthConnection;
