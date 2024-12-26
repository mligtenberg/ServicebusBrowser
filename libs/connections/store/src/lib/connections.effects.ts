import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as actions from './connections.actions';
import * as internalActions from './connections.internal-actions';
import { ServiceBusElectronClient } from '@service-bus-browser/service-bus-electron-client';
import { from, map, switchMap, tap } from 'rxjs';
import { Logger } from '@service-bus-browser/logs-services';
import { TopologyActions } from '@service-bus-browser/topology-store';

@Injectable({
  providedIn: 'root'
})
export class ConnectionsEffects {
  actions$ = inject(Actions);
  serviceBusClient = inject(ServiceBusElectronClient);
  logger = inject(Logger);

  addConnection$ = createEffect(
    () => this.actions$.pipe(
      ofType(actions.addConnection),
      switchMap(({ connection }) => from(this.serviceBusClient.addConnection(connection)).pipe(
        map(() => internalActions.connectionAdded({ connectionId: connection.id }))
      )),
    ),
  )

  reloadOnConnectionAdded$ = createEffect(
    () => this.actions$.pipe(
      ofType(internalActions.connectionAdded),
      map(() => TopologyActions.loadNamespaces())
    ),
  )

  testConnection$ = createEffect(
    () => this.actions$.pipe(
      ofType(actions.checkConnection),
      switchMap(({ connection }) => from(this.serviceBusClient.checkConnection(connection)).pipe(
        tap(result => {
          if (result) {
            this.logger.info('Connection test succeeded', connection);
          } else {
            this.logger.error('Connection test failed', connection);
          }})
      )),
    ),
    { dispatch: false }
  )
}
