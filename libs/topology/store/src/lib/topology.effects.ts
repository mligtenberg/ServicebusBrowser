import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { ServiceBusElectronClient } from '@service-bus-browser/service-bus-electron-client';
import * as actions from './topology.actions';
import * as internalActions from './topology.internal-actions';
import { catchError, from, map, mergeMap, switchMap, take } from 'rxjs';
import { Namespace } from '@service-bus-browser/topology-contracts';
import { Action, Store } from '@ngrx/store';
import { selectNamespaceById, selectTopicById } from './topology.selectors';

@Injectable()
export class TopologyEffects implements OnInitEffects {
  ngrxOnInitEffects(): Action {
    return actions.loadNamespaces();
  }
  store = inject(Store);
  actions$ = inject(Actions);
  serviceBusClient = inject(ServiceBusElectronClient);

  loadNamespaces$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadNamespaces),
    mergeMap(() => from(this.serviceBusClient.listConnections()).pipe(
      map((namespaces) =>
        internalActions.namespacesLoaded({
          namespaces: namespaces.map<Namespace>((con) => ({
            id: con.connectionId,
            name: con.connectionName,
          })),
        })
      ),
      catchError((error) => [internalActions.failedToLoadNamespaces({
        error: { title: 'Failed to load namespace', detail: error.toString() }
      })])
    )),
  ));

  loadQueues$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadQueues),
    mergeMap(({ namespaceId }) => from(this.serviceBusClient.listQueues(namespaceId)).pipe(
      catchError((error) => [{ problem: { title: 'failed to load queues', detail: error.toString()} }]),
      switchMap((queues) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, queues })),
        take(1)
      )),
      map(({queues, namespace}) => {
        if (queues instanceof Array) {
          return internalActions.queuesLoaded({ namespace: namespace!, queues })
        }
        return internalActions.failedToLoadQueues({ namespace: namespace!, error: queues.problem})
      })
    )),
  ));

  loadQueue$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadQueue),
    mergeMap(({ namespaceId, queueId }) => from(this.serviceBusClient.getQueue(namespaceId, queueId)).pipe(
      catchError((error) => [{ problem: { title: 'failed to load queue', detail: error.toString()} }]),
      switchMap((queue) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, queue })),
        take(1)
      )),
      map(({queue, namespace}) => {
        if ('problem' in queue) {
          return internalActions.failedToLoadQueue({ namespace: namespace!, error: queue.problem });
        }
        return internalActions.queueLoaded({ namespace: namespace!, queue: queue });
      })
    )),
  ));

  addQueue$ = createEffect(() => this.actions$.pipe(
    ofType(actions.addQueue),
    mergeMap(({ namespaceId, queue }) => from(this.serviceBusClient.createQueue(namespaceId, queue)).pipe(
      map(() => queue),
      catchError((error) => [{ problem: { title: 'failed to add queue', detail: error.toString()} }]),
      switchMap((queue) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, queue })),
        take(1)
      )),
      map(({ namespace, queue }) => {
        if ('problem' in queue) {
          return internalActions.failedToAddQueue({ namespace: namespace!, error: queue.problem });
        }
        return internalActions.queueAdded({ namespace: namespace!, queue: queue });
      })
    )),
  ));

  editQueue$ = createEffect(() => this.actions$.pipe(
    ofType(actions.editQueue),
    mergeMap(({ namespaceId, queue }) => from(this.serviceBusClient.editQueue(namespaceId, queue)).pipe(
      map(() => queue),
      catchError((error) => [{ problem: { title: 'failed to edit queue', detail: error.toString()} }]),
      switchMap((queue) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, queue })),
        take(1)
      )),
      map(({ namespace, queue }) => {
        if ('problem' in queue) {
          return internalActions.failedToEditQueue({ namespace: namespace!, error: queue.problem });
        }
        return internalActions.queueEdited({ namespace: namespace!, queue: queue });
      })
    )),
  ));

  removeQueue$ = createEffect(() => this.actions$.pipe(
    ofType(actions.removeQueue),
    mergeMap(({ namespaceId, queueId }) => from(this.serviceBusClient.removeQueue(namespaceId, queueId)).pipe(
      map(() => queueId),
      catchError((error) => [{ problem: { title: 'failed to remove queue', detail: error.toString()} }]),
      switchMap((queueId) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, queueId })),
        take(1)
      )),
      map(({ namespace, queueId }) => {
        if (typeof(queueId) === 'object') {
          return internalActions.failedToEditQueue({ namespace: namespace!, error: queueId.problem });
        }
        return internalActions.queueRemoved({ namespace: namespace!, queueId: queueId });
      })
    )),
  ));

  loadTopics$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadTopics),
    mergeMap(({ namespaceId }) => from(this.serviceBusClient.listTopics(namespaceId)).pipe(
      catchError((error) => [{ problem: { title: 'failed to load topics', detail: error.toString()} }]),
      switchMap((topics) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, topics })),
        take(1)
      )),
      map(({ topics, namespace }) => {
        if (topics instanceof Array) {
          return internalActions.topicsLoaded({ namespace: namespace!, topics })
        }

        return internalActions.failedToLoadTopics({ namespace: namespace!, error: topics.problem});
      })
    )),
  ));

  loadTopic$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadTopic),
    mergeMap(({ namespaceId, topicId }) => from(this.serviceBusClient.getTopic(namespaceId, topicId)).pipe(
      catchError((error) => [{ problem: { title: 'failed to load topic', detail: error.toString()} }]),
      switchMap((topic) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, topic })),
        take(1)
      )),
      map(({topic, namespace}) => {
        if ('problem' in topic) {
          return internalActions.failedToLoadTopic({ namespace: namespace!, error: topic.problem });
        }
        return internalActions.topicLoaded({ namespace: namespace!, topic: topic });
      })
    )),
  ));

  addTopic$ = createEffect(() => this.actions$.pipe(
    ofType(actions.addTopic),
    mergeMap(({ namespaceId, topic }) => from(this.serviceBusClient.createTopic(namespaceId, topic)).pipe(
      map(() => topic),
      catchError((error) => [{ problem: { title: 'failed to add topic', detail: error.toString()} }]),
      switchMap((topic) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, topic })),
        take(1)
      )),
      map(({ namespace, topic }) => {
        if ('problem' in topic) {
          return internalActions.failedToAddTopic({ namespace: namespace!, error: topic.problem });
        }
        return internalActions.topicAdded({ namespace: namespace!, topic: topic });
      })
    )),
  ));

  editTopic$ = createEffect(() => this.actions$.pipe(
    ofType(actions.editTopic),
    mergeMap(({ namespaceId, topic }) => from(this.serviceBusClient.editTopic(namespaceId, topic)).pipe(
      map(() => topic),
      catchError((error) => [{ problem: { title: 'failed to edit topic', detail: error.toString()} }]),
      switchMap((topic) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, topic })),
        take(1)
      )),
      map(({ namespace, topic }) => {
        if ('problem' in topic) {
          return internalActions.failedToEditTopic({ namespace: namespace!, error: topic.problem });
        }
        return internalActions.topicEdited({ namespace: namespace!, topic: topic });
      })
    )),
  ));

  deleteTopic$ = createEffect(() => this.actions$.pipe(
    ofType(actions.removeTopic),
    mergeMap(({ namespaceId, topicId }) => from(this.serviceBusClient.removeTopic(namespaceId, topicId)).pipe(
      map(() => topicId),
      catchError((error) => [{ problem: { title: 'failed to delete topic', detail: error.toString()} }]),
      switchMap((topicId) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, topicId })),
        take(1)
      )),
      map(({ namespace, topicId }) => {
        if (typeof(topicId) === 'object') {
          return internalActions.failedToEditTopic({ namespace: namespace!, error: topicId.problem });
        }
        return internalActions.topicRemoved({ namespace: namespace!, topicId: topicId });
      })
    )),
  ));

  loadSubscriptions$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadSubscriptions),
    mergeMap(({ namespaceId, topicId }) => from(this.serviceBusClient.listSubscriptions(namespaceId, topicId)).pipe(
      catchError((error) => [{ problem: { title: 'failed to load subscriptions', detail: error.toString()} }]),
      switchMap((subscriptions) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, subscriptions })),
        take(1)
      )),
      switchMap(({subscriptions, namespace}) => this.store.select(selectTopicById(namespaceId, topicId)).pipe(
        map((topic) => ({ namespace, subscriptions, topic })),
        take(1)
      )),
      map(({subscriptions, namespace, topic}) => {
        if (subscriptions instanceof Array) {
          return internalActions.subscriptionsLoaded({ namespace: namespace!, topic: topic!, subscriptions })
        }
        return internalActions.failedToLoadSubscriptions({ namespace: namespace!, topic: topic!, error: subscriptions.problem });
      })
    )),
  ));

  loadSubscription$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadSubscription),
    mergeMap(({ namespaceId, topicId, subscriptionId }) => from(this.serviceBusClient.getSubscription(namespaceId, topicId, subscriptionId)).pipe(
      catchError((error) => [{ problem: { title: 'failed to load subscription', detail: error.toString()} }]),
      switchMap((subscription) => this.store.select(selectNamespaceById(namespaceId)).pipe(
        map((namespace) => ({ namespace, subscription })),
        take(1)
      )),
      switchMap(({subscription, namespace}) => this.store.select(selectTopicById(namespaceId
        , topicId)).pipe(
        map((topic) => ({ namespace, subscription, topic })),
        take(1)
      )),
      map(({subscription, namespace, topic}) => {
        if ('problem' in subscription) {
          return internalActions.failedToLoadSubscription({ namespace: namespace!, topic: topic!, error: subscription.problem });
        }
        return internalActions.subscriptionLoaded({ namespace: namespace!, topic: topic!, subscription: subscription });
      })
    )),
  ));

  loadQueuesOnNamespaceLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.namespacesLoaded),
    mergeMap(({ namespaces }) =>
      from(namespaces.map((ns) => actions.loadQueues({ namespaceId: ns.id })))
    )
  ));

  loadQueueOnQueueAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.queueAdded),
    mergeMap(({ queue, namespace }) =>
      from([actions.loadQueue({ namespaceId: namespace.id, queueId: queue.id })])
    )
  ));

  loadTopicOnTopicAdded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicAdded),
    mergeMap(({ topic, namespace }) =>
      from([actions.loadTopic({ namespaceId: namespace.id, topicId: topic.id })])
    )
  ));

  loadTopicsOnNamespaceLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.namespacesLoaded),
    mergeMap(({ namespaces }) =>
      from(namespaces.map((ns) => actions.loadTopics({ namespaceId: ns.id })))
    )
  ));

  loadSubscriptionsOnTopicsLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicsLoaded),
    mergeMap(({ topics, namespace }) =>
      from(topics.map((topic) => actions.loadSubscriptions({ namespaceId: namespace.id, topicId: topic.id })))
    )
  ));

  loadSubscriptionsOnTopicLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.topicLoaded),
    mergeMap(({ topic, namespace }) =>
      from([actions.loadSubscriptions({ namespaceId: namespace.id, topicId: topic.id })])
    )
  ));

}
