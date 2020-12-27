import { ipcMain } from "electron";
import { IConnection, MessagesChannel, servicebusQueuesChannels } from "../../../ipcModels";
import * as queuesService from "../services/servicebusQueues.service";

export function initServicebusQueuesHandler() {
  ipcMain.on(servicebusQueuesChannels.GET_QUEUES, async (event, ...args) => {
    if (args.length !== 1) {
        event.reply(servicebusQueuesChannels.GET_QUEUES_RESPONSE, false, `expected 1 argument got ${args.length}`)
    }

    const connection = args[0] as IConnection;
    try {
      var queues = await queuesService.getQueues(connection);
      event.reply(servicebusQueuesChannels.GET_QUEUES_RESPONSE, true, queues);
    } catch (e) {
      const reason = !!e.message
        ? e.message
        : "Failed because of unknown reason";
      event.reply(servicebusQueuesChannels.GET_QUEUES_RESPONSE, false, reason);
    }
  });

  ipcMain.on(servicebusQueuesChannels.GET_QUEUES_MESSAGES, async (event, ...args) => {
    if (args.length !== 4) {
        event.reply(servicebusQueuesChannels.GET_QUEUES_MESSAGES_RESPONSE, false, `expected 4 argument got ${args.length}`)
    }
    const connection = args[0] as IConnection;
    const queueName = args[1] as string;
    const numberOfMessages = args[2] as number;
    const messagesChannel = args[3] as MessagesChannel;
    try {
      var messages = await queuesService.getQueuesMessages(connection, queueName, numberOfMessages, messagesChannel);
      event.reply(servicebusQueuesChannels.GET_QUEUES_MESSAGES_RESPONSE, true, messages);
    } catch (e) {
      const reason = !!e.message
        ? e.message
        : "Failed because of unknown reason";
      event.reply(servicebusQueuesChannels.GET_QUEUES_MESSAGES_RESPONSE, false, reason);
    }
  })
}
