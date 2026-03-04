import { UUID } from '@service-bus-browser/shared-contracts';
import { MessageQueueTargetType } from './message-queue-types';

interface ConnectionBase {
  id: UUID;
  type: string;
  name: string;
  target: MessageQueueTargetType;
}

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

export interface ServiceBusAzureCliAuthConnection extends ServiceBusAzureADConnection {
  authMethod: 'azureCli';
}

export interface ServiceBusAzureServicePrincipalConnection extends ServiceBusAzureADConnection {
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

export type Connection =
  | ServiceBusConnectionStringConnection
  | ServiceBusAzureCliAuthConnection
  | ServiceBusAzureServicePrincipalConnection
  | ServiceBusSystemAssignedManagedIdentityConnection
  | ServiceBusUserAssignedManagedIdentityConnection;
