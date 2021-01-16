import { ServiceBusAdministrationClient, ServiceBusClient } from "@azure/service-bus";
import { ConnectionType, IConnection, IConnectionStringConnectionDetails } from "../../../ipcModels";
import { IServicebusConnectionService } from "../../../ipcModels/services";

export class ServicebusConnectionService implements IServicebusConnectionService {
    getClient(connection: IConnection): ServiceBusClient {
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
    getAdminClient(connection: IConnection): ServiceBusAdministrationClient {
        switch (connection.connectionType) {
            case ConnectionType.connectionString:
              const connectionDetails = connection.connectionDetails as IConnectionStringConnectionDetails;
              return new ServiceBusAdministrationClient(connectionDetails.connectionString);
            default:
              throw new Error(
                "Connection type not supported yet, cannot create client"
              );
          }
    }

}