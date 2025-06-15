import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as actions from './connections.actions';
import * as internalActions from './connections.internal-actions';
import { ServiceBusManagementElectronClient } from '@service-bus-browser/service-bus-electron-client';
import { catchError, from, map, switchMap } from 'rxjs';
import { TopologyActions } from '@service-bus-browser/topology-store';

@Injectable({
  providedIn: 'root'
})
export class ConnectionsEffects {
  actions$ = inject(Actions);
  serviceBusClient = inject(ServiceBusManagementElectronClient);

  addConnection$ = createEffect(
    () => this.actions$.pipe(
      ofType(actions.addConnection),
      switchMap(({ connection }) => from(this.serviceBusClient.addConnection(connection)).pipe(
        map(() => internalActions.connectionAdded({ connectionId: connection.id })),
        catchError(error => [internalActions.failedToAddConnection({ connectionId: connection.id, error: {
          title: 'Failed to add connection',
          detail: error.message,
        }})]),
      )),
    ),
  )

  removeConnection$ = createEffect(
    () => this.actions$.pipe(
      ofType(actions.removeConnection),
      switchMap(({ connectionId }) => from(this.serviceBusClient.removeConnection(connectionId)).pipe(
        map(() => internalActions.connectionRemoved({ connectionId })),
        catchError(error => [internalActions.failedToRemoveConnection({ connectionId, error: {
          title: 'Failed to remove connection',
          detail: error.message,
        }})]),
      )),
    ),
  )

  reloadOnConnectionChanged$ = createEffect(
    () => this.actions$.pipe(
      ofType(internalActions.connectionAdded, internalActions.connectionRemoved),
      map(() => TopologyActions.loadNamespaces()),
    ),
  )

  testConnection$ = createEffect(
    () => this.actions$.pipe(
      ofType(actions.checkConnection),
      switchMap(({ connection }) => from(this.serviceBusClient.checkConnection(connection)).pipe(
        map(result => {
          if (result) {
            return internalActions.connectionCheckedSuccessfully({ connection });
          }

          return internalActions.connectionCheckFailed({ connection });
        })
      )),
    ),
  )
}
