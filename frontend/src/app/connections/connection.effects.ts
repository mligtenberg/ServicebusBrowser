import { Injectable } from '@angular/core';
import {
  Actions,
  createEffect,
  ofType,
  OnInitEffects,
} from '@ngrx/effects';
import { catchError, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { ConnectionService } from './connection.service';
import * as actions from './ngrx/connections.actions';
import { defer, from, of } from 'rxjs';
import { State } from '../ngrx.module';
import { Action, Store } from '@ngrx/store';
import { getSelectedConnection } from './ngrx/connections.selectors';
import { Router } from '@angular/router';

@Injectable()
export class ConnectionEffects implements OnInitEffects {
  constructor(
    private actions$: Actions,
    private servicebusConnection: ConnectionService,
    private store: Store<State>,
    private router: Router
  ) {}

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
          return of(
            actions.testConnectionFailed({
              error: 'selectedConnection is empty',
            })
          );
        }
        return from(this.servicebusConnection.testConnection(connection)).pipe(
          map(() => actions.testConnectionSuccess()),
          catchError((error) =>
            of(actions.testConnectionFailed({ error: error as string }))
          )
        );
      })
    );
  });

  storeConnection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.storeSelectedConnection),
      withLatestFrom(this.store.select(getSelectedConnection)),
      mergeMap(([action, connection]) => {
        return from(
          this.servicebusConnection.storeConnectionAsync({
            ...connection,
            isNew: false
          })
        ).pipe(
          map(() => actions.storeSelectedConnectionSuccess()),
          catchError((error) =>
            of(actions.storeSelectedConnectionFailed(error))
          )
        );
      })
    );
  });

  loadStoredConnections$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.connectionsLoad),
      mergeMap(() => {
        return from(this.servicebusConnection.getStoredConnectionsAsync()).pipe(
          map((connections) => actions.connectionsLoadSuccess({ connections }))
        );
      })
    );
  });

  deleteConnection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.deleteConnection),
      mergeMap((action) => {
        return from(
          this.servicebusConnection.deleteConnectionAsync(action.id)
        ).pipe(map(() => actions.deleteConnectionSuccess({ id: action.id })));
      })
    );
  });

  openSelectedConnection$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(actions.openSelectedConnection),
        map(() => actions.clearSelectedConnection())
      );
    },
  );

  clearSelectedConnection$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(actions.clearSelectedConnection),
        tap(() => this.router.navigate(['']))
      );
    },
    { dispatch: false }
  );

  createConnection$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(actions.createConnection),
        tap(() => this.router.navigateByUrl('/connections/edit'))
      );
    },
    { dispatch: false }
  );
}
