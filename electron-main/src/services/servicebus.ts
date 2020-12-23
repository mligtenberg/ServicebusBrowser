import { ipcMain } from "electron";
import {
  ServiceBusClient,
  ServiceBusAdministrationClient,
  QueueRuntimeProperties,
  TopicRuntimeProperties,
} from "@azure/service-bus";
import {
  ConnectionType,
  IConnection,
  IConnectionStringConnectionDetails,
} from "../../../ipcModels/IConnection";
import { IQueue } from "../../../ipcModels/IQueue";
import { ITopic } from "../../../ipcModels/ITopic";
import { serviceBusChannels } from "../../../ipcModels/channels";

async function test(connection: IConnection): Promise<boolean> {
  const client = initAdminClient(connection);

  // try a simple operation
  await client.listQueues().next();

  return true;
}

async function getQueues(connection: IConnection): Promise<IQueue[]> {
  const client = initAdminClient(connection);

  let finished = false;
  const queues: QueueRuntimeProperties[] = [];

  do {
    const result = await client.listQueuesRuntimeProperties().next();
    queues.push(result.value);
    finished = result.done ?? false;
  } while (finished);

  return queues.map(q => {
    return {
      name: q.name,
      queuedMessages: q.activeMessageCount,
      deadLetterMessages: q.deadLetterMessageCount,
      scheduledMessages: q.scheduledMessageCount
    } as IQueue
  })
}

async function getTopics(connection: IConnection): Promise<ITopic[]> {
  const client = initAdminClient(connection);

  let finished = false;
  const topics: TopicRuntimeProperties[] = [];

  do {
    const result = await client.listTopicsRuntimeProperties().next();
    topics.push(result.value);
    finished = result.done ?? false;
  } while (finished);

  return topics.map(q => {
    return {
      name: q.name,
    } as ITopic
  })
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
  ipcMain.on(serviceBusChannels.TEST, (event, ...args) => {
    const connection = args[0] as IConnection;
    test(connection)
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

  ipcMain.on(serviceBusChannels.GET_QUEUES, async (event, ...args) => {
    const connection = args[0] as IConnection;
    try {
      var queues = await getQueues(connection);
      event.reply(serviceBusChannels.GET_QUEUES_RESPONSE, true, queues);
    } catch (e) {
      const reason = !!e.message
        ? e.message
        : "Failed because of unknown reason";
      event.reply(serviceBusChannels.GET_QUEUES_RESPONSE, false, reason);
    }
  });

  ipcMain.on(serviceBusChannels.GET_TOPICS, async (event, ...args) => {
    const connection = args[0] as IConnection;
    try {
      var topics = await getTopics(connection);
      event.reply(serviceBusChannels.GET_TOPICS_REPONSE, true, topics);
    } catch (e) {
      const reason = !!e.message
        ? e.message
        : "Failed because of unknown reason";
      event.reply(serviceBusChannels.GET_TOPICS_REPONSE, false, reason);
    }
  });
}
