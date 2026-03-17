import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as actions from './connections.actions';
import * as internalActions from './connections.internal-actions';
import { ManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { catchError, from, map, switchMap } from 'rxjs';
import { TopologyActions } from '@service-bus-browser/topology-store';

@Injectable({
  providedIn: 'root',
})
export class ConnectionsEffects {
  actions$ = inject(Actions);
  serviceBusClient = inject(ManagementFrontendClient);

  addConnection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addConnection),
      switchMap(({ connection }) =>
        from(this.serviceBusClient.addConnection(connection)).pipe(
          map(() =>
            internalActions.connectionAdded({ connectionId: connection.id })
          ),
          catchError((error) => [
            internalActions.failedToAddConnection({
              connectionId: connection.id,
              error: {
                title: 'Failed to add connection',
                detail: error.message,
              },
            }),
          ])
        )
      )
    )
  );

  testConnection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.checkConnection),
      switchMap(({ connection }) =>
        from(this.serviceBusClient.checkConnection(connection)).pipe(
          map((result) => {
            if (result) {
              return internalActions.connectionCheckedSuccessfully({
                connection,
              });
            }

            return internalActions.connectionCheckFailed({ connection });
          })
        )
      )
    )
  );

  refreshTopology$ = createEffect(() =>
    this.actions$.pipe(
      ofType(internalActions.connectionAdded),
      map(() => TopologyActions.loadTopologyRootNodes())
    )
  );
}
