import { Connection } from '@service-bus-browser/service-bus-contracts';
import {
  TokenCredential,
  ManagedIdentityCredential,
  AzureCliCredential,
  ClientSecretCredential
} from '@azure/identity';
import { AzureNamedKeyCredential, NamedKeyCredential } from '@azure/core-auth';
import { UUID } from "@service-bus-browser/shared-contracts";
import { parseConnectionString } from "@azure/core-amqp";

export type ServiceBusCredential = {
  namespaceId: UUID,
  hostName: string,
  credential: TokenCredential | NamedKeyCredential
}

export function getCredential(connection: Connection): ServiceBusCredential {
  if (connection.type === 'connectionString') {
    const parsedConnectionString = parseConnectionString<{
      Endpoint: string;
      EntityPath?: string;
      SharedAccessSignature?: string;
      SharedAccessKey?: string;
      SharedAccessKeyName?: string;
      UseDevelopmentEmulator?: string;
    }>(connection.connectionString);

    const hostName = parsedConnectionString.Endpoint.replace('sb://', '').replace(/\/$/, '');
    const sharedAccessKeyName = parsedConnectionString.SharedAccessKeyName;
    const sharedAccessKey = parsedConnectionString.SharedAccessKey;

    if (sharedAccessKeyName === undefined || sharedAccessKey === undefined) {
      throw new Error(`Connection string is missing SharedAccessKeyName or SharedAccessKey`);
    }

    return {
      namespaceId: connection.id,
      hostName,
      credential: new AzureNamedKeyCredential(sharedAccessKeyName, sharedAccessKey)
    }
  }

  const { authMethod } = connection;

  switch (authMethod) {
    case 'azureCli':
      return {
        namespaceId: connection.id,
        hostName: connection.fullyQualifiedNamespace,
        credential: new AzureCliCredential()
      };
    case 'ServicePrincipalClientSecret':
      return {
        namespaceId: connection.id,
        hostName: connection.fullyQualifiedNamespace,
        credential: new ClientSecretCredential(
          connection.tenantId,
          connection.clientId,
          connection.clientSecret
        )
      }
    case 'systemAssignedManagedIdentity':
      return {
        namespaceId: connection.id,
        hostName: connection.fullyQualifiedNamespace,
        credential: new ManagedIdentityCredential()
      };
    case 'userAssignedManagedIdentity':
      return {
        namespaceId: connection.id,
        hostName: connection.fullyQualifiedNamespace,
        credential: new ManagedIdentityCredential(connection.clientId)
      }
    default:
      throw new Error(`Unsupported auth method: ${authMethod}`);
  }
}
