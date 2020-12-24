import { ipcMain } from "electron";
import { servicebusTopicsChannels, IConnection } from "../../../ipcModels";
import * as topicsService from "../services/servicebusTopics.service";

export function initServicebusTopicsHandler() {
  ipcMain.on(servicebusTopicsChannels.GET_TOPICS, async (event, ...args) => {
    const connection = args[0] as IConnection;
    try {
      var topics = await topicsService.getTopics(connection);
      event.reply(servicebusTopicsChannels.GET_TOPICS_REPONSE, true, topics);
    } catch (e) {
      const reason = !!e.message
        ? e.message
        : "Failed because of unknown reason";
      event.reply(servicebusTopicsChannels.GET_TOPICS_REPONSE, false, reason);
    }
  });
}
