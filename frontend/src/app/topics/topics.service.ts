import { Injectable } from '@angular/core';
import { LogService } from '../logging/log.service';
import { ITopic, ISubscription } from './ngrx/topics.models';
import {
  TopicRuntimeProperties,
  SubscriptionRuntimeProperties,
  ServiceBusAdministrationClient,
  SubscriptionProperties,
  TopicProperties,
} from "@azure/service-bus";
import { ConnectionService } from '../connections/connection.service';
import { IConnection } from '../connections/ngrx/connections.models';

@Injectable({
  providedIn: 'root'
})
export class TopicsService {

  constructor(
    private connectionService: ConnectionService,
    private log: LogService
  ) {}

  public async getTopics(connection: IConnection): Promise<ITopic[]> {
    this.log.logInfo(`Retreiving topics for connection '${connection.name}'`);
    try {
      const topics = await this.getTopicsInternal(connection);
      this.log.logInfo(`Retreived ${topics.length} topics for '${connection.name}'`);
      return topics;
    }
    catch (reason) {
      this.log.logWarning(`Retreiving topics failed: ${reason}`);
      throw reason;
    }
  }

  public async getTopicSubscriptions(connection: IConnection, topicName: string): Promise<ISubscription[]> {
    this.log.logInfo(`Retreiving topics for connection '${connection.name}'`);
    try {
      const subscriptions = await this.getTopicSubscriptionsInternal(connection, topicName);
      this.log.logInfo(`Retreived ${subscriptions.length} subscriptions for '${connection.name}/${topicName}'`);
      return subscriptions;
    } catch(reason) {
      this.log.logWarning(`Retreiving topic subscriptions failed: ${reason}`);
      throw reason;
    }
  }

  private async getTopicsInternal(connection: IConnection): Promise<ITopic[]> {
    const client = this.connectionService.getAdminClient(connection);
  
    const runtimeProperties: TopicRuntimeProperties[] = await this.getTopicRuntimeProperties(client);
    const topics: TopicProperties[] = await this.getTopicProperties(client);
    return topics.map((t) => {
      const rp = runtimeProperties.find(rp => t.name === rp.name);
      return {
        name: t.name,
        properties: {
          autoDeleteOnIdle: t.autoDeleteOnIdle,
          defaultMessageTimeToLive: t.defaultMessageTimeToLive,
          duplicateDetectionHistoryTimeWindow: t.duplicateDetectionHistoryTimeWindow,
          enableBatchedOperations: t.enableBatchedOperations,
          enableExpress: t.enableExpress,
          enablePartitioning: t.enablePartitioning,
          maxSizeInMegabytes: t.maxSizeInMegabytes,
          requiresDuplicateDetection: t.requiresDuplicateDetection,
          supportOrdering: t.supportOrdering,
          userMetadata: t.userMetadata,
          authorizationRules: t.authorizationRules
        },
        info: {
          status: t.status,
          availabilityStatus: t.availabilityStatus,
          accessedAt: rp?.accessedAt,
          createdAt: rp?.createdAt,
          modifiedAt: rp?.modifiedAt,
          scheduledMessageCount: rp?.scheduledMessageCount,
          sizeInBytes: rp?.sizeInBytes,
          subscriptionCount: rp?.subscriptionCount
        }
      } as ITopic;
    });
  }
  
  private async getTopicProperties(client: ServiceBusAdministrationClient): Promise<TopicProperties[]> {
    let finished = false;
    const topics: TopicProperties[] = [];
  
    const iterator = client.listTopics();
    do {
      const result = await iterator.next();
      if (result.value) {
        topics.push(result.value);
      }
      finished = result.done ?? true;
    } while (!finished);
    return topics;
  }
  
  private async getTopicRuntimeProperties(client: ServiceBusAdministrationClient): Promise<TopicRuntimeProperties[]> {
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
    return topics;
  }
  
  private async getTopicSubscriptionsInternal(
    connection: IConnection,
    topicName: string
  ) {
    const client = this.connectionService.getAdminClient(connection);
  
    const subscriptions = await this.getSubscriptionProperties(client, topicName);
    const runtimeProperties = await this.getSubscriptionRuntimeProperties(client, topicName);
  
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
  
  private async getSubscriptionProperties(client: ServiceBusAdministrationClient, topicName: string): Promise<SubscriptionProperties[]> {
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
  
  private async getSubscriptionRuntimeProperties(client: ServiceBusAdministrationClient, topicName: string): Promise<SubscriptionRuntimeProperties[]> {
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
}
