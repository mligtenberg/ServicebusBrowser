import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as actions from './connections.actions';
import * as internalActions from './connections.internal-actions';
import { ManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { catchError, from, map, switchMap } from 'rxjs';
import { TopologyActions } from '@service-bus-browser/topology-store';
import { WorkspaceService } from '@service-bus-browser/services';

@Injectable({
  providedIn: 'root',
})
export class ConnectionsEffects {
  actions$ = inject(Actions);
  serviceBusClient = inject(ManagementFrontendClient);
  workspaceService = inject(WorkspaceService);

  addConnection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.addConnection),
      switchMap(({ connection }) => {
        const connectionToAdd = {
          ...connection,
          workspaceId:
            connection.workspaceId ?? this.workspaceService.activeWorkspace()?.id,
        };
        return from(this.serviceBusClient.addConnection(connectionToAdd)).pipe(
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
        );
      })
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

            return internalActions.connectionCheckFailed({
              connection,
              error: {
                title: 'Connection test failed',
                detail:
                  'The connection could not be validated. Please check your connection details and try again.',
              },
            });
          }),
          catchError((error) => [
            internalActions.connectionCheckFailed({
              connection,
              error: {
                title: 'Connection test failed',
                detail: error?.message ?? String(error),
              },
            }),
          ])
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
