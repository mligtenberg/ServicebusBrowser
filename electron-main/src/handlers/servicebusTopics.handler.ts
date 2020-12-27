import { ipcMain } from "electron";
import { servicebusTopicsChannels, IConnection, MessagesChannel } from "../../../ipcModels";
import * as topicsService from "../services/servicebusTopics.service";

export function initServicebusTopicsHandler() {
  ipcMain.on(servicebusTopicsChannels.GET_TOPICS, async (event, ...args) => {
    if (args.length !== 1) {
        // Fatal error, we cannot respond.
        console.error({message: "Fatal error, arguments do not aline with what is expected, cannot respond", args});
    }

    const connection = args[0] as IConnection;
    try {
      var topics = await topicsService.getTopics(connection);
      event.reply(servicebusTopicsChannels.GET_TOPICS_REPONSE(connection.id ?? ''), true, topics);
    } catch (e) {
      const reason = !!e.message
        ? e.message
        : "Failed because of unknown reason";
      event.reply(servicebusTopicsChannels.GET_TOPICS_REPONSE(connection.id ?? ''), false, reason);
    }
  });

  ipcMain.on(servicebusTopicsChannels.GET_TOPIC_SUBSCRIPTION, async (event, ...args) => {
    if (args.length !== 2) {
      // Fatal error, we cannot respond.
      console.error({message: "Fatal error, arguments do not aline with what is expected, cannot respond", args});
    }

    const connection = args[0] as IConnection;
    const topicName = args[1] as string;
    try {
      var subscriptions = await topicsService.getSubscriptionsForTopic(connection, topicName);
      event.reply(servicebusTopicsChannels.GET_TOPIC_SUBSCRIPTION_RESPONSE(connection.id ?? '', topicName), true, subscriptions);
    } catch (e) {
      const reason = !!e.message
        ? e.message
        : "Failed because of unknown reason";
      event.reply(servicebusTopicsChannels.GET_TOPIC_SUBSCRIPTION_RESPONSE(connection.id ?? '', topicName), false, reason);
    }
  });

  ipcMain.on(servicebusTopicsChannels.GET_TOPIC_SUBSCRIPTION_MESSAGES, async (event, ...args) => {
    if (args.length !== 5) {
      // Fatal error, we cannot respond.
      console.error({message: "Fatal error, arguments do not aline with what is expected, cannot respond", args});
    }

    const connection = args[0] as IConnection;
    const topicName = args[1] as string;
    const subscriptionName = args[2] as string;
    const numberOfMessages = args[3] as number;
    const messagesChannel = args[4] as MessagesChannel;
    
    try {
      var messages = await topicsService.getSubscriptionMessages(connection, topicName, subscriptionName, numberOfMessages, messagesChannel);
      event.reply(servicebusTopicsChannels.GET_TOPIC_SUBSCRIPTION_MESSAGES_RESPONSE(
        connection.id ?? '', topicName, subscriptionName), true, messages);
    } catch (e) {
      const reason = !!e.message
        ? e.message
        : "Failed because of unknown reason";
      event.reply(servicebusTopicsChannels.GET_TOPIC_SUBSCRIPTION_MESSAGES_RESPONSE(
        connection.id ?? '', topicName, subscriptionName), false, reason);
    }
  })
}
