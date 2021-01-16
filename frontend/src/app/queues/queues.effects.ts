import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, from } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { getActiveConnections } from '../connections/ngrx/connections.selectors';
import { State } from '../ngrx.module';
import * as actions from "./ngrx/queues.actions";
import { QueuesService } from './queues.service';

@Injectable()
export class QueuesEffects {
  constructor(
    private actions$: Actions,
    private queuesService: QueuesService,
    private store: Store<State>
    ) {}

  getQueues$ = createEffect(() => {
    return this.actions$.pipe(
      // listen for the type of testConnection
      ofType(actions.refreshQueues),
      // retreive the currently selected connection
      withLatestFrom(this.store.select(getActiveConnections)),

      // execute the test and return the result
      mergeMap(([action, connections]) => {
        if (!connections || connections.length === 0) {
          return of(actions.refreshQueuesFailed({connectionId: action.connectionId, error: 'No connections present'}))
        }
        
        const connection = connections.find(c => c.id === action.connectionId);
        if (!connection) {
          return of(actions.refreshQueuesFailed({connectionId: action.connectionId, error: `Connection with id ${action.connectionId} not found`}))
        }

        return from(this.queuesService.getQueues(connection))
        .pipe(
          map((result) => actions.refreshQueuesSuccess({connectionId: connection.id, queues: result})),
          catchError(error => of(actions.refreshQueuesFailed({ connectionId: connection.id, error: error as string })))
        )
      })
    )
  });
}
