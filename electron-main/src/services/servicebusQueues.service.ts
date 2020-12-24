import { QueueRuntimeProperties } from "@azure/service-bus";
import { IConnection, IQueue } from "../../../ipcModels";
import { getAdminClient } from "./servicebusConnections.service";

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
