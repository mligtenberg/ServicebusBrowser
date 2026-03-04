import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import {
  loadTopologyRootNodes,
  refreshTopology,
  reloadReceiveEndpoint,
  reloadSendEndpoint,
} from './topology.actions';
import { catchError, from, map, switchMap } from 'rxjs';
import { ServiceBusManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import {
  topologyRefreshed,
  topologyRefreshFailed,
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
          map((topology) =>
            topologyRefreshed({
              path: path,
              node: topology,
            }),
          ),
          catchError((err) => [topologyRefreshFailed({ path, error: err })]),
        );
      }),
    ),
  );

  refreshSendEndpoint$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reloadSendEndpoint),
      map(({ endpoint }) => {
        if (endpoint.target === 'serviceBus' && endpoint.type === 'queue') {
          return `/${endpoint.connectionId}/queues/${endpoint.queueName}`;
        }
        if (endpoint.target === 'serviceBus' && endpoint.type === 'topic') {
          return `/${endpoint.connectionId}/topics/${endpoint.topicName}`;
        }
        return `/${endpoint['connectionId']}`
      }),
      map((path) => refreshTopology({ path })),
    )
  )

  refreshReceiveEndpoint$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reloadReceiveEndpoint),
      map(({ endpoint }) => {
        if (
          endpoint.target === 'serviceBus' &&
          endpoint.type === 'queue'
        ) {
          return `/${endpoint.connectionId}/queues/${endpoint.queueName}`;
        }
        if (
          endpoint.target === 'serviceBus' &&
          endpoint.type === 'subscription'
        ) {
          return `/${endpoint.connectionId}/topics/${endpoint.topicName}/subscriptions/${endpoint.subscriptionName}`;
        }
        return `/${endpoint['connectionId']}`
      }),
      map((path) => refreshTopology({ path })),
    )
  )
}
