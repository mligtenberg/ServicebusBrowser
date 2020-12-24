import { QueueRuntimeProperties } from "@azure/service-bus";
import { IConnection, IMessage, IQueue } from "../../../ipcModels";
import { getAdminClient, getClient } from "./servicebusConnections.service";

export async function getQueues(connection: IConnection): Promise<IQueue[]> {
  const client = getAdminClient(connection);

  let finished = false;
  const queues: QueueRuntimeProperties[] = [];

  do {
    const result = await client.listQueuesRuntimeProperties().next();
    queues.push(result.value);
    finished = result.done ?? false;
  } while (finished);

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
        return {
            subject: m.subject,
            body: m.body,
        } as IMessage;
    });
}