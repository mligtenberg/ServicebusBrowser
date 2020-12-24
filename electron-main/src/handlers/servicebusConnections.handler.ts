import { ipcMain } from "electron";
import { serviceBusChannels } from "../../../ipcModels/channels";
import { IConnection } from "../../../ipcModels/IConnection";
import * as connectionService from "../services/servicebusConnections.service";

export function initServicebusConnectionsHandler() {
  ipcMain.on(serviceBusChannels.TEST, (event, ...args) => {
    const connection = args[0] as IConnection;
    connectionService
      .testConnection(connection)
      .then(() => {
        event.reply(serviceBusChannels.TEST_RESPONSE, true);
      })
      .catch((e) => {
        const reason = !!e.message
          ? e.message
          : "Failed because of unknown reason";
        event.reply(serviceBusChannels.TEST_RESPONSE, false, reason);
      });
  });
}
