import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators'
import { ServicebusConnectionService } from './servicebus-connection.service';
import * as actions from "./ngrx/connections.actions";
import { of } from 'rxjs';
import { State } from '../ngrx.module';
import { Store } from '@ngrx/store';
import { getSelectedConnection } from './ngrx/connections.selectors';

@Injectable()
export class ServicebusConnectionEffects {

  constructor
  (
    private actions$: Actions,
    private servicebusConnection: ServicebusConnectionService,
    private store: Store<State>,
  ) {  }

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
}
