import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Logger } from '@service-bus-browser/logs-services';
import { tap } from 'rxjs';
import * as internalActions from './topology.internal-actions';

@Injectable({
  providedIn: 'root'
})
export class TopologyLoggingEffects {
  actions$ = inject(Actions);
  logger = inject(Logger);

  logNamespacesLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.namespacesLoaded),
    tap(({ namespaces }) => this.logger.info(`${namespaces.length} Namespaces loaded`))
  ), { dispatch: false });

  logQueuesLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.queuesLoaded),
    tap(({ queues, namespace }) => this.logger.info(`${queues.length} Queues loaded for namespace ${namespace.name}`))
  ), { dispatch: false });

  logTopicsLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicsLoaded),
    tap(({ topics, namespace }) => this.logger.info(`${topics.length} Topics loaded for namespace ${namespace.name}`))
  ), { dispatch: false });

  logSubscriptionsLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionsLoaded),
    tap(({ subscriptions, topic, namespace }) => this.logger.info(`${subscriptions.length} Subscriptions loaded for topic ${topic.name} in namespace ${namespace.name}`))
  ), { dispatch: false });

  logFailedToLoadNamespaces$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToLoadNamespaces),
    tap(({ error }) => this.logger.error(`Failed to load namespaces: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logFailedToLoadQueues$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToLoadQueues),
    tap(({ error, namespace }) => this.logger.error(`Failed to load queues for namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logFailedToLoadTopics$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToLoadTopics),
    tap(({ error, namespace }) => this.logger.error(`Failed to load topics for namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logFailedToLoadSubscriptions$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToLoadSubscriptions),
    tap(({ error, namespace, topic }) => this.logger.error(`Failed to load subscriptions for topic ${topic?.name} in namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logQueueAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.queueAdded),
    tap(({ queue, namespace }) => this.logger.info(`Queue ${queue.name} added to namespace ${namespace.name}`))
  ), { dispatch: false });

  logFailedToAddQueue$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToAddQueue),
    tap(({ error, namespace }) => this.logger.error(`Failed to add queue to namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logQueueEdited$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.queueEdited),
    tap(({ queue, namespace }) => this.logger.info(`Queue ${queue.name} edited in namespace ${namespace.name}`))
  ), { dispatch: false });

  logFailedToEditQueue$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToEditQueue),
    tap(({ error, namespace }) => this.logger.error(`Failed to edit queue in namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logQueueRemoved$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.queueRemoved),
    tap(({ queueId, namespace }) => this.logger.info(`Queue ${queueId} removed from namespace ${namespace.name}`))
  ), { dispatch: false });

  logFailedToRemoveQueue$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToRemoveQueue),
    tap(({ error, namespace }) => this.logger.error(`Failed to remove queue from namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logTopicAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicAdded),
    tap(({ topic, namespace }) => this.logger.info(`Topic ${topic.name} added to namespace ${namespace.name}`))
  ), { dispatch: false });

  logFailedToAddTopic$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToAddTopic),
    tap(({ error, namespace }) => this.logger.error(`Failed to add topic to namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logTopicEdited$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicEdited),
    tap(({ topic, namespace }) => this.logger.info(`Topic ${topic.name} edited in namespace ${namespace.name}`))
  ), { dispatch: false });

  logFailedToEditTopic$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToEditTopic),
    tap(({ error, namespace }) => this.logger.error(`Failed to edit topic in namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logTopicRemoved$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicRemoved),
    tap(({ topicId, namespace }) => this.logger.info(`Topic ${topicId} removed from namespace ${namespace.name}`))
  ), { dispatch: false });

  logFailedToRemoveTopic$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToRemoveTopic),
    tap(({ error, namespace }) => this.logger.error(`Failed to remove topic from namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logSubscriptionAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionAdded),
    tap(({ subscription, namespace, topic }) => this.logger.info(`Subscription ${subscription.name} added to topic ${topic.name} in namespace ${namespace.name}`))
  ), { dispatch: false });

  logFailedToAddSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToAddSubscription),
    tap(({ error, namespace, topic }) => this.logger.error(`Failed to add subscription to topic ${topic?.name} in namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logSubscriptionEdited$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionEdited),
    tap(({ subscription, namespace, topic }) => this.logger.info(`Subscription ${subscription.name} edited in topic ${topic.name} in namespace ${namespace.name}`))
  ), { dispatch: false });

  logFailedToEditSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToEditSubscription),
    tap(({ error, namespace, topic }) => this.logger.error(`Failed to edit subscription in topic ${topic?.name} in namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logSubscriptionRemoved$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionRemoved),
    tap(({ subscriptionId, namespace, topic }) => this.logger.info(`Subscription ${subscriptionId} removed from topic ${topic.name} in namespace ${namespace.name}`))
  ), { dispatch: false });

  logFailedToRemoveSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToRemoveSubscription),
    tap(({ error, namespace, topic }) => this.logger.error(`Failed to remove subscription from topic ${topic?.name} in namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logSubscriptionRuleAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionRuleAdded),
    tap(({ rule, namespace, topic, subscription }) => this.logger.info(`Rule ${rule.name} added to subscription ${subscription?.name} in topic ${topic?.name} in namespace ${namespace?.name}`))
  ), { dispatch: false });

  logFailedToAddSubscriptionRule$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToAddSubscriptionRule),
    tap(({ error, namespace, topic, subscription }) => this.logger.error(`Failed to add rule to subscription ${subscription?.name} in topic ${topic?.name} in namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logSubscriptionRuleEdited$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionRuleEdited),
    tap(({ rule, namespace, topic, subscription }) => this.logger.info(`Rule ${rule.name} edited in subscription ${subscription?.name} in topic ${topic?.name} in namespace ${namespace?.name}`))
  ), { dispatch: false });

  logFailedToEditSubscriptionRule$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToEditSubscriptionRule),
    tap(({ error, namespace, topic, subscription }) => this.logger.error(`Failed to edit rule in subscription ${subscription?.name} in topic ${topic?.name} in namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

  logSubscriptionRuleRemoved$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.subscriptionRuleRemoved),
    tap(({ ruleName, namespace, topic, subscription }) => this.logger.info(`Rule ${ruleName} removed from subscription ${subscription?.name} in topic ${topic?.name} in namespace ${namespace?.name}`))
  ), { dispatch: false });

  logFailedToRemoveSubscriptionRule$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.failedToRemoveSubscriptionRule),
    tap(({ error, namespace, topic, subscription }) => this.logger.error(`Failed to remove rule from subscription ${subscription?.name} in topic ${topic?.name} in namespace ${namespace?.name}: ${error.title} - ${error.detail}`))
  ), { dispatch: false });

}
