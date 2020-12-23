import { Injectable } from '@angular/core';
import { Actions, createEffect, Effect, ofType, OnInitEffects, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators'
import { ConnectionService } from './connection.service';
import * as actions from "./ngrx/connections.actions";
import { defer, from, of } from 'rxjs';
import { State } from '../ngrx.module';
import { Action, Store } from '@ngrx/store';
import { getSelectedConnection } from './ngrx/connections.selectors';

@Injectable()
export class ConnectionEffects implements OnInitEffects {

  constructor
  (
    private actions$: Actions,
    private servicebusConnection: ConnectionService,
    private store: Store<State>,
  ) {  }
  
  ngrxOnInitEffects(): Action {
    return actions.connectionsLoad();
  }

  testConnections$ = createEffect(() => {
    return this.actions$.pipe(
      // listen for the type of testConnection
      ofType(actions.testConnection),
      // retreive the currently selected connection
      withLatestFrom(this.store.select(getSelectedConnection)),

      // execute the test and return the result
      mergeMap(([action, connection]) => {
        if (connection === null) {
          return of(actions.testConnectionFailed({error: 'selectedConnection is empty'}))
        }
        return this.servicebusConnection.testConnection(connection)
        .pipe(
          map(() => actions.testConnectionSuccess()),
          catchError(error => of(actions.testConnectionFailed({ error: error as string })))
        )
      })
    )
  });

  storeConnection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.storeSelectedConnection),
      withLatestFrom(this.store.select(getSelectedConnection)),
      mergeMap(([action, connection]) => {
        return from(this.servicebusConnection.storeConnectionAsync(connection))
        .pipe(
          map(() => actions.storeSelectedConnectionSuccess()),
          catchError(error => of(actions.storeSelectedConnectionFailed(error)))
        )
      })
    )
  });

  loadStoredConnections$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.connectionsLoad),
      mergeMap(() => {
        console.log('aaa');
        return from(this.servicebusConnection.getConnectionOptionsAsync())
        .pipe(map((connections) => actions.connectionsLoadSuccess({connections})));
      })
    )
  });
}
