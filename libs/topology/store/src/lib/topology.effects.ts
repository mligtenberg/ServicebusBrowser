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
}
