import {Injectable} from '@angular/core';
import {LogService} from '../logging/log.service';
import {ISubscription} from './ngrx/topics.models';
import {
  SubscriptionRuntimeProperties,
  ServiceBusAdministrationClient,
  SubscriptionProperties,
  RuleProperties,
} from '@azure/service-bus';
import {ConnectionService} from '../connections/connection.service';
import {IConnection} from '../connections/ngrx/connections.models';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {

  constructor(
    private connectionService: ConnectionService,
    private log: LogService
  ) {
  }

  public async getTopicSubscriptions(connection: IConnection, topicName: string): Promise<ISubscription[]> {
    this.log.logInfo(`Retreiving topics for connection '${connection.name}'`);
    try {
      const subscriptions = await this.getTopicSubscriptionsInternal(connection, topicName);
      this.log.logInfo(`Retreived ${subscriptions.length} subscriptions for '${connection.name}/${topicName}'`);
      return subscriptions;
    } catch (reason) {
      this.log.logWarning(`Retreiving topic subscriptions failed: ${reason}`);
      throw reason;
    }
  }

  private async getTopicSubscriptionsInternal(connection: IConnection, topicName: string): Promise<ISubscription[]> {
    const client = this.connectionService.getAdminClient(connection);

    const subscriptions = await this.getSubscriptionProperties(client, topicName);
    const runtimePropertiesList = await this.getSubscriptionRuntimeProperties(client, topicName);

    const returnItems: ISubscription[] = [];

    for (const s of subscriptions) {
      const runtimeProperties = runtimePropertiesList
        .find(rp => s.topicName === rp.topicName && s.subscriptionName === rp.subscriptionName);
      const rules = await this.getSubscriptionRules(client, topicName, s.subscriptionName);

      returnItems.push({
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
          accessedAt: runtimeProperties?.accessedAt,
          activeMessageCount: runtimeProperties?.activeMessageCount,
          createdAt: runtimeProperties?.createdAt,
          deadLetterMessageCount: runtimeProperties?.deadLetterMessageCount,
          modifiedAt: runtimeProperties?.modifiedAt,
          topicName: runtimeProperties?.topicName,
          totalMessageCount: runtimeProperties?.totalMessageCount,
          transferDeadLetterMessageCount: runtimeProperties?.transferDeadLetterMessageCount,
          transferMessageCount: runtimeProperties?.transferMessageCount
        },
        rules
      });
    }

    return returnItems;
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

  private async getSubscriptionRuntimeProperties(client: ServiceBusAdministrationClient, topicName: string)
    : Promise<SubscriptionRuntimeProperties[]> {
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

  private async getSubscriptionRules(client: ServiceBusAdministrationClient, topicName: string, subscriptionName: string)
    : Promise<RuleProperties[]> {
    let finished = false;
    const rules: RuleProperties[] = [];

    const iterator = client.listRules(topicName, subscriptionName);
    do {
      const result = await iterator.next();
      if (result.value) {
        rules.push(result.value);
      }
      finished = result.done ?? true;
    } while (!finished);
    return rules;
  }

  public async updateSubscription(connection: IConnection, topicName: string, subscription: ISubscription): Promise<void> {
    const client = this.connectionService.getAdminClient(connection);
    const servicebusSubscription = await client.getSubscription(topicName, subscription.name);

    servicebusSubscription.autoDeleteOnIdle = subscription.properties.autoDeleteOnIdle;
    servicebusSubscription.deadLetteringOnFilterEvaluationExceptions = subscription.properties.deadLetteringOnFilterEvaluationExceptions;
    servicebusSubscription.deadLetteringOnMessageExpiration = subscription.properties.deadLetteringOnMessageExpiration;
    servicebusSubscription.defaultMessageTimeToLive = subscription.properties.defaultMessageTimeToLive;
    servicebusSubscription.enableBatchedOperations = subscription.properties.enableBatchedOperations;
    servicebusSubscription.forwardDeadLetteredMessagesTo = subscription.properties.forwardDeadLetteredMessagesTo;
    servicebusSubscription.forwardTo = subscription.properties.forwardTo;
    servicebusSubscription.lockDuration = subscription.properties.lockDuration;
    servicebusSubscription.maxDeliveryCount = subscription.properties.maxDeliveryCount;
    servicebusSubscription.userMetadata = subscription.properties.userMetadata;

    const result = await client.updateSubscription(servicebusSubscription);
  }
}
