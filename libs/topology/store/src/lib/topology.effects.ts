import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import {
  loadQueue,
  loadSubscription,
  loadTopic,
  loadTopologyRootNodes,
  refreshTopology,
  reloadReceiveEndpoint,
  reloadSendEndpoint,
} from './topology.actions';
import { from, map, switchMap } from 'rxjs';
import { ServiceBusManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import {
  topologyRefreshed,
  topologyRootNodesLoaded,
} from './topology.internal-actions';
import { Action } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class TopologyEffects implements OnInitEffects {
  ngrxOnInitEffects(): Action {
    return loadTopologyRootNodes();
  }

  actions$ = inject(Actions);
  serviceBusClient = inject(ServiceBusManagementFrontendClient);

  loadTopology$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTopologyRootNodes),
      switchMap(() => {
        return from(this.serviceBusClient.listTopologies()).pipe(
          map((topologies) => topologyRootNodesLoaded({ nodes: topologies })),
        );
      }),
    ),
  );

  refreshTopology$ = createEffect(() =>
    this.actions$.pipe(
      ofType(refreshTopology),
      switchMap(({ path }) => {
        return from(this.serviceBusClient.refreshTopology(path)).pipe(
          map((topology) => topologyRefreshed({
            path: path,
            node: topology
          })),
        )
      }),
    ),
  );

  reloadReceiveEndpoint$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reloadReceiveEndpoint),
      map(({ endpoint }) => {
        if ('queueName' in endpoint) {
          return loadQueue({
            namespaceId: endpoint.connectionId,
            queueId: endpoint.queueName,
          });
        }

        return loadSubscription({
          namespaceId: endpoint.connectionId,
          topicId: endpoint.topicName,
          subscriptionId: endpoint.subscriptionName,
        });
      }),
    ),
  );

  reloadSendEndpoint$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reloadSendEndpoint),
      map(({ endpoint }) => {
        if ('queueName' in endpoint) {
          return loadQueue({
            namespaceId: endpoint.connectionId,
            queueId: endpoint.queueName,
          });
        }

        return loadTopic({
          namespaceId: endpoint.connectionId,
          topicId: endpoint.topicName,
        });
      }),
    ),
  );
}
