import { ServiceBusClient, ServiceBusAdministrationClient } from "@azure/service-bus"

export function getClient(connection) {
    switch (connection.connectionType) {
        case 0:
          const connectionDetails = connection.connectionDetails;
          return new ServiceBusClient(connectionDetails.connectionString);
        default:
          throw new Error(
            "Connection type not supported yet, cannot create client"
          );
      }
},
export function getAdminClient(connection) {
    switch (connection.connectionType) {
        case 0:
          const connectionDetails = connection.connectionDetails;
          return new ServiceBusAdministrationClient(connectionDetails.connectionString);
        default:
          throw new Error(
            "Connection type not supported yet, cannot create client"
          );
      }
}