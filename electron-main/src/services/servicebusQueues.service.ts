import { QueueRuntimeProperties } from "@azure/service-bus";
import { IConnection, IMessage, IQueue, MessagesChannel } from "../../../ipcModels";
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
      transferedDeadletterMessages: q.transferDeadLetterMessageCount,
    } as IQueue;
  });
}

export async function getQueuesMessages(
  connection: IConnection,
  queueName: string,
  numberOfMessages: number,
  channel: MessagesChannel
): Promise<IMessage[]> {
  const client = getClient(connection);
  const receiver = client.createReceiver(queueName, {
    subQueueType: channel === MessagesChannel.deadletter ? 'deadLetter' : undefined
  });
  
  const messages = await receiver.peekMessages(numberOfMessages);

  receiver.close();
  client.close();

  return messages.map((m) => {
    const message = {
      id: m.messageId,
      subject: m.subject,
      body: `${m.body}`,
      properties: new Map<string, string>(),
      customProperties: new Map<string, string>(),
    } as IMessage;

    message.properties.set("ContentType", m.contentType ?? "");
    message.properties.set("correlationId", m.correlationId?.toString() ?? "");

    for (const propertyName in m._rawAmqpMessage.deliveryAnnotations) {
      message.properties.set(
        propertyName,
        (m._rawAmqpMessage.deliveryAnnotations as any)[propertyName]
      );
    }

    for (const propertyName in m._rawAmqpMessage.properties) {
      message.properties.set(
        propertyName,
        (m._rawAmqpMessage.properties as any)[propertyName]
      );
    }

    for (const propertyName in m._rawAmqpMessage.messageAnnotations) {
      message.properties.set(
        propertyName,
        (m._rawAmqpMessage.messageAnnotations as any)[propertyName]
      );
    }

    for (const propertyName in m._rawAmqpMessage.footer) {
      message.properties.set(
        propertyName,
        (m._rawAmqpMessage.messageAnnotations as any)[propertyName]
      );
    }

    for (const propertyName in m.applicationProperties) {
      message.customProperties.set(
        propertyName,
        m.applicationProperties[propertyName].toString()
      );
    }

    return message;
  });
}
