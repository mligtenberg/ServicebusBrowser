import { ipcMain } from "electron";
import { IConnection, serviceBusChannels } from "../../../ipcModels";
import * as queuesService from "../services/servicebusQueues.service";

export function initServicebusQueuesHandler() {
  ipcMain.on(serviceBusChannels.GET_QUEUES, async (event, ...args) => {
    const connection = args[0] as IConnection;
    try {
      var queues = await queuesService.getQueues(connection);
      event.reply(serviceBusChannels.GET_QUEUES_RESPONSE, true, queues);
    } catch (e) {
      const reason = !!e.message
        ? e.message
        : "Failed because of unknown reason";
      event.reply(serviceBusChannels.GET_QUEUES_RESPONSE, false, reason);
    }
  });
}
