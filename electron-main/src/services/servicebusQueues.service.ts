import { QueueProperties, QueueRuntimeProperties, ServiceBusAdministrationClient } from "@azure/service-bus";
import { IConnection, IMessage, IQueue, MessagesChannel } from "../../../ipcModels";
import { getAdminClient, getClient } from "./servicebusConnections.service";

export async function getQueues(connection: IConnection): Promise<IQueue[]> {
  const client = getAdminClient(connection);

  const queues = await getQueueProperties(client);
  const queueRuntimeProperties = await getQueueRuntimeProperties(client);


  return queues.map((q) => {
    const runtimeProperties = queueRuntimeProperties.find(qrp => qrp.name === q.name);

    return {
      name: q.name,
      properties: {
        autoDeleteOnIdle: q.autoDeleteOnIdle,
        deadLetteringOnMessageExpiration: q.deadLetteringOnMessageExpiration,
        defaultMessageTimeToLive: q.defaultMessageTimeToLive,
        duplicateDetectionHistoryTimeWindow: q.duplicateDetectionHistoryTimeWindow,
        enableBatchedOperations: q.enableBatchedOperations,
        enableExpress: q.enableExpress,
        enablePartitioning: q.enablePartitioning,
        lockDuration: q.lockDuration,
        maxDeliveryCount: q.maxDeliveryCount,
        maxSizeInMegabytes: q.maxSizeInMegabytes,
        requiresDuplicateDetection: q.requiresDuplicateDetection,
        requiresSession: q.requiresSession,
        userMetadata: q.userMetadata,
        forwardDeadLetteredMessagesTo: q.forwardDeadLetteredMessagesTo,
        forwardTo: q.forwardTo
      },
      info: {
        accessedAt: runtimeProperties?.accessedAt,
        activeMessageCount: runtimeProperties?.activeMessageCount,
        availabilityStatus: q.availabilityStatus,
        createdAt: runtimeProperties?.createdAt,
        deadLetterMessageCount: runtimeProperties?.deadLetterMessageCount,
        modifiedAt: runtimeProperties?.modifiedAt,
        scheduledMessageCount: runtimeProperties?.scheduledMessageCount,
        status: q.status,
        transferDeadLetterMessageCount: runtimeProperties?.transferDeadLetterMessageCount,
        transferMessageCount: runtimeProperties?.transferMessageCount,
        sizeInBytes: runtimeProperties?.sizeInBytes,
        totalMessageCount: runtimeProperties?.totalMessageCount
      },
      authorizationRules: q.authorizationRules ?? []
    } as IQueue;
  });
}

async function getQueueProperties(client: ServiceBusAdministrationClient): Promise<QueueProperties[]> {
  let finished = false;
  const queues: QueueProperties[] = [];

  const iterator = client.listQueues();
  do {
    const result = await iterator.next();
    if (result.value) {
      queues.push(result.value);
    }
    finished = result.done ?? false;
  } while (!finished);

  return queues;
}

async function getQueueRuntimeProperties(client: ServiceBusAdministrationClient): Promise<QueueRuntimeProperties[]> {
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

  return queues;
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
