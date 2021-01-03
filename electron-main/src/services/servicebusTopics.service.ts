import {
  TopicRuntimeProperties,
  SubscriptionRuntimeProperties,
  ServiceBusAdministrationClient,
  SubscriptionProperties,
} from "@azure/service-bus";
import { IConnection, IMessage, ISubscription, ITopic, MessagesChannel } from "../../../ipcModels";
import { getAdminClient, getClient } from "./servicebusConnections.service";

export async function getTopics(connection: IConnection): Promise<ITopic[]> {
  const client = getAdminClient(connection);

  let finished = false;
  const topics: TopicRuntimeProperties[] = [];

  const iterator = client.listTopicsRuntimeProperties();
  do {
    const result = await iterator.next();
    if (result.value) {
      topics.push(result.value);
    }
    finished = result.done ?? true;
  } while (!finished);

  return topics.map((q) => {
    return {
      name: q.name,
    } as ITopic;
  });
}

export async function getSubscriptionsForTopic(
  connection: IConnection,
  topicName: string
) {
  const client = getAdminClient(connection);

  const subscriptions = await getSubscriptionProperties(client, topicName);
  const runtimeProperties = await getSubscriptionRuntimeProperties(client, topicName);

  return subscriptions.map((s) => {
    const rp = runtimeProperties.find(rp => s.topicName === rp.topicName && s.subscriptionName === rp.subscriptionName);
    return {
      name: s.subscriptionName,
      properties: {
        autoDeleteOnIdle: s.autoDeleteOnIdle,
        deadLetteringOnFilterEvaluationExceptions: s.deadLetteringOnFilterEvaluationExceptions,
        deadLetteringOnMessageExpiration: s.deadLetteringOnMessageExpiration,
        defaultMessageTimeToLive: s.defaultMessageTimeToLive,
        enableBatchedOperations: s.enableBatchedOperations,
        lockDuration: s.lockDuration,
        maxDeliveryCount: s.maxDeliveryCount,
        requiresSession: s.requiresSession,
        forwardDeadLetteredMessagesTo: s.forwardDeadLetteredMessagesTo,
        forwardTo: s.forwardTo,
        userMetadata: s.userMetadata
      },
      info: {
        status: s.status,
        availabilityStatus: s.availabilityStatus,
        accessedAt: rp?.accessedAt,
        activeMessageCount: rp?.activeMessageCount,
        createdAt: rp?.createdAt,
        deadLetterMessageCount: rp?.deadLetterMessageCount,
        modifiedAt: rp?.modifiedAt,
        topicName: rp?.topicName,
        totalMessageCount: rp?.totalMessageCount,
        transferDeadLetterMessageCount: rp?.transferDeadLetterMessageCount,
        transferMessageCount: rp?.transferMessageCount
      }
    } as ISubscription;
  });
}

async function getSubscriptionProperties(client: ServiceBusAdministrationClient, topicName: string): Promise<SubscriptionProperties[]> {
  let finished = false;
  const subscriptions: SubscriptionProperties[] = [];

  const iterator = client.listSubscriptions(topicName);
  do {
    const result = await iterator.next();
    if (result.value) {
      subscriptions.push(result.value);
    }
    finished = result.done ?? true;
  } while (!finished);
  return subscriptions;
}

async function getSubscriptionRuntimeProperties(client: ServiceBusAdministrationClient, topicName: string): Promise<SubscriptionRuntimeProperties[]> {
  let finished = false;
  const subscriptions: SubscriptionRuntimeProperties[] = [];

  const iterator = client.listSubscriptionsRuntimeProperties(topicName);
  do {
    const result = await iterator.next();
    if (result.value) {
      subscriptions.push(result.value);
    }
    finished = result.done ?? true;
  } while (!finished);
  return subscriptions;
}

export async function getSubscriptionMessages(
  connection: IConnection,
  topicName: string,
  subscriptionName: string,
  numberOfMessages: number,
  channel: MessagesChannel
): Promise<IMessage[]> {
  const client = getClient(connection);
  const receiver = client.createReceiver(topicName, subscriptionName, {
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
