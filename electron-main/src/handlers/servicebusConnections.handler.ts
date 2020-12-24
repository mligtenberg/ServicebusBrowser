import { ipcMain } from "electron";
import { servicebusConnectionsChannels } from "../../../ipcModels/channels";
import { IConnection } from "../../../ipcModels/IConnection";
import * as connectionService from "../services/servicebusConnections.service";

export function initServicebusConnectionsHandler() {
  ipcMain.on(servicebusConnectionsChannels.TEST, (event, ...args) => {
    if (args.length !== 1) {
      event.reply(servicebusConnectionsChannels.TEST_RESPONSE, false, `expected 1 argument got ${args.length}`);
      console.log(args);
    }

    const connection = args[0] as IConnection;
    connectionService
      .testConnection(connection)
      .then(() => {
        event.reply(servicebusConnectionsChannels.TEST_RESPONSE, true);
      })
      .catch((e) => {
        const reason = !!e.message
          ? e.message
          : "Failed because of unknown reason";
        event.reply(servicebusConnectionsChannels.TEST_RESPONSE, false, reason);
      });
  });
}
