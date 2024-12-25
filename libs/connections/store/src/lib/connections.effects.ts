import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as actions from './connections.actions';
import * as internalActions from './connections.internal-actions';
import { ServiceBusElectronClient } from '@service-bus-browser/service-bus-electron-client';
import { from, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionsEffects {
  actions$ = inject(Actions);
  serviceBusClient = inject(ServiceBusElectronClient);

  addConnection$ = createEffect(
    () => this.actions$.pipe(
      ofType(actions.addConnection),
      switchMap(({ connection }) => from(this.serviceBusClient.addConnection(connection)).pipe(
        map(() => internalActions.connectionAdded({ connectionId: connection.id }))
      )),
    ),
  )

  testConnection$ = createEffect(
    () => this.actions$.pipe(
      ofType(actions.checkConnection),
      switchMap(({ connection }) => from(this.serviceBusClient.checkConnection(connection)).pipe(

      )),
    ),
    { dispatch: false }
  )
}
