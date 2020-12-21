import { ipcMain, ipcRenderer } from "electron";
import {
  ServiceBusClient,
  ServiceBusAdministrationClient,
} from "@azure/service-bus";
import {
  ConnectionType,
  IConnection,
  IConnectionStringConnectionDetails,
} from "../models/IConnection";
import global from '../global';

function test(connection: IConnection): Promise<boolean> {
  const client = initAdminClient(connection);

  // try a simple operation
  return client
    .listQueues()
    .next()
    .then((c) => {
      return true;
    }) as Promise<boolean>;
}

function initClient(connection: IConnection): ServiceBusClient {
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

function initAdminClient(
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

export function initServicebusHandler() {
  ipcMain.on("servicebus:test", (event, ...args) => {
    const connection = args[0] as IConnection;
    test(connection).then(() => {
        event.reply('servicebus:test.result', true);
    }).catch(e => {
        const reason = !!e.message ? e.message : "Failed because of unknown reason";
        event.reply('servicebus:test.result', false, reason);
    });
  });
}
