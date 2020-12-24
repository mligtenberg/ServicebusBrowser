import {
  ServiceBusAdministrationClient,
  ServiceBusClient,
} from "@azure/service-bus";
import {
  ConnectionType,
  IConnection,
  IConnectionStringConnectionDetails,
} from "../../../ipcModels";

export function getClient(connection: IConnection): ServiceBusClient {
  switch (connection.connectionType) {
    case ConnectionType.connectionString:
      const connectionDetails = connection.connectionDetails as IConnectionStringConnectionDetails;
      return new ServiceBusClient(connectionDetails.connectionString);
    default:
      throw new Error(
        "Connection type not supported yet, cannot create client"
      );
  }
}

export function getAdminClient(
  connection: IConnection
): ServiceBusAdministrationClient {
  switch (connection.connectionType) {
    case ConnectionType.connectionString:
      const connectionDetails = connection.connectionDetails as IConnectionStringConnectionDetails;
      return new ServiceBusAdministrationClient(
        connectionDetails.connectionString
      );
    default:
      throw new Error(
        "Connection type not supported yet, cannot create client"
      );
  }
}

export async function testConnection(connection: IConnection): Promise<boolean> {
    const client = getAdminClient(connection);
  
    // try a simple operation
    await client.listQueues().next();
  
    return true;
  }