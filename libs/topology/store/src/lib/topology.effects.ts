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

  loadQueuesOnNamespaceLoaded$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.namespacesLoaded),
    mergeMap(({ namespaces }) =>
      from(namespaces.map((ns) => actions.loadQueues({ namespaceId: ns.id })))
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
}
