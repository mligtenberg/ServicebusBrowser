import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { ServiceBusManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import * as actions from './topology.actions';
import * as internalActions from './topology.internal-actions';
import { catchError, from, map, mergeMap } from 'rxjs';
import { Namespace } from '@service-bus-browser/topology-contracts';
import { Action } from '@ngrx/store';

@Injectable()
export class TopologyNamespacesEffects {
  actions$ = inject(Actions);
  serviceBusClient = inject(ServiceBusManagementFrontendClient);

  loadNamespaces$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadNamespaces),
      mergeMap(() =>
        from(this.serviceBusClient.listConnections()).pipe(
          map((namespaces) =>
            internalActions.namespacesLoaded({
              namespaces: namespaces.map<Namespace>((con) => ({
                id: con.connectionId,
                name: con.connectionName,
              })),
            })
          ),
          catchError((error) => [
            internalActions.failedToLoadNamespaces({
              error: {
                title: 'Failed to load namespace',
                detail: error.toString(),
              },
            }),
          ])
        )
      )
    )
  );
}
