import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  loadTopologyRootNodes,
  refreshTopology,
  reloadReceiveEndpoint,
  reloadSendEndpoint,
} from './topology.actions';
import { catchError, from, map, switchMap } from 'rxjs';
import { ManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import {
  topologyRefreshed,
  topologyRefreshFailed,
  topologyRootNodesLoaded,
} from './topology.internal-actions';

@Injectable({
  providedIn: 'root',
})
export class TopologyEffects {
  actions$ = inject(Actions);
  serviceBusClient = inject(ManagementFrontendClient);

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
        if (endpoint.target === 'rabbitmq' && endpoint.type === 'queue') {
          return `/${endpoint.connectionId}/vhosts/${encodeURIComponent(endpoint.vhostName)}/queues/${encodeURIComponent(endpoint.queueName)}`;
        }
        if (endpoint.target === 'rabbitmq' && endpoint.type === 'exchange') {
          return `/${endpoint.connectionId}/vhosts/${encodeURIComponent(endpoint.vhostName)}/exchanges`;
        }
        return `/${endpoint['connectionId']}`;
      }),
      map((path) => refreshTopology({ path })),
    ),
  );

  refreshReceiveEndpoint$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reloadReceiveEndpoint),
      map(({ endpoint }) => {
        if (endpoint.target === 'serviceBus' && endpoint.type === 'queue') {
          return `/${endpoint.connectionId}/queues/${endpoint.queueName}`;
        }
        if (
          endpoint.target === 'serviceBus' &&
          endpoint.type === 'subscription'
        ) {
          return `/${endpoint.connectionId}/topics/${endpoint.topicName}/subscriptions/${endpoint.subscriptionName}`;
        }
        if (endpoint.target === 'rabbitmq' && endpoint.type === 'queue') {
          return `/${endpoint.connectionId}/vhosts/${encodeURIComponent(endpoint.vhostName)}/queues/${encodeURIComponent(endpoint.queueName)}`;
        }
        return `/${endpoint['connectionId']}`;
      }),
      map((path) => refreshTopology({ path })),
    ),
  );
}
