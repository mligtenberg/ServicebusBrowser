import { QueueRuntimeProperties } from "@azure/service-bus";
import { IConnection, IMessage, IQueue } from "../../../ipcModels";
import { getAdminClient, getClient } from "./servicebusConnections.service";

export async function getQueues(connection: IConnection): Promise<IQueue[]> {
  const client = getAdminClient(connection);

  let finished = false;
  const queues: QueueRuntimeProperties[] = [];

  const iterator = client.listQueuesRuntimeProperties();
  do {
    const result = await iterator.next();
    if (result.value) {
      queues.push(result.value);
    }
    finished = result.done ?? false;
  } while (!finished);

  return queues.map((q) => {
    return {
      name: q.name,
      queuedMessages: q.activeMessageCount,
      deadLetterMessages: q.deadLetterMessageCount,
      scheduledMessages: q.scheduledMessageCount,
    } as IQueue;
  });
}

export async function getQueuesMessages(connection:IConnection, queueName: string, numberOfMessages: number): Promise<IMessage[]> {
    const client = getClient(connection);
    const receiver = client.createReceiver(queueName);
    const messages = await receiver.peekMessages(numberOfMessages);

    receiver.close();
    client.close();

    return messages.map(m => {
        const message = {
          id: m.messageId,
          subject: m.subject,
          body: `${m.body}`,
          properties: new Map<string, string>(),
          customProperties: new Map<string, string>(),
        } as IMessage;

        return message;
    });
}