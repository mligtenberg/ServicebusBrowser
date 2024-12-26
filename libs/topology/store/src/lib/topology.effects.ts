import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { ServiceBusElectronClient } from '@service-bus-browser/service-bus-electron-client';
import * as actions from './topology.actions';
import * as internalActions from './topology.internal-actions';
import { from, map, mergeMap } from 'rxjs';
import { Namespace } from '@service-bus-browser/topology-contracts';
import { Action } from '@ngrx/store';

@Injectable()
export class TopologyEffects implements OnInitEffects {
  ngrxOnInitEffects(): Action {
    return actions.loadNamespaces();
  }
  actions$ = inject(Actions);
  serviceBusClient = inject(ServiceBusElectronClient);

  loadNamespaces$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadNamespaces),
    mergeMap(() => this.serviceBusClient.listConnections()),
    map((namespaces) =>
      internalActions.namespacesLoaded({
        namespaces: namespaces.map<Namespace>((con) => ({
          id: con.connectionId,
          name: con.connectionName,
        })),
      })
    )
  ));

  loadQueues$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadQueues),
    mergeMap(({ namespaceId }) => from(this.serviceBusClient.listQueues(namespaceId)).pipe(
      map((queues) => internalActions.queuesLoaded({ namespaceId, queues }))
    )),
  ));

  loadTopics$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadTopics),
    mergeMap(({ namespaceId }) => from(this.serviceBusClient.listTopics(namespaceId)).pipe(
      map((topics) => internalActions.topicsLoaded({ namespaceId, topics }))
    )),
  ));

  loadSubscriptions$ = createEffect(() => this.actions$.pipe(
    ofType(actions.loadSubscriptions),
    mergeMap(({ namespaceId, topicId }) => from(this.serviceBusClient.listSubscriptions(namespaceId, topicId)).pipe(
      map((subscriptions) => internalActions.subscriptionsLoaded({ namespaceId, topicId, subscriptions }))
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
    mergeMap(({ topics, namespaceId }) =>
      from(topics.map((topic) => actions.loadSubscriptions({ namespaceId, topicId: topic.id })))
    )
  ));
}
