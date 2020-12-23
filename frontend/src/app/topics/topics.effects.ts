import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { State } from '../ngrx.module';
import { TopicsService } from './topics.service';
import * as actions from "./ngrx/topics.actions";
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { getActiveConnections } from '../connections/ngrx/connections.selectors';
import { of } from 'rxjs';

@Injectable()
export class TopicsEffects {
  constructor(
    private actions$: Actions,
    private topicsService: TopicsService,
    private store: Store<State>,
  ) {}

  getTopics$ = createEffect(() => {
    return this.actions$.pipe(
      // listen for the type of testConnection
      ofType(actions.refreshTopics),
      // retreive the currently selected connection
      withLatestFrom(this.store.select(getActiveConnections)),

      // execute the test and return the result
      mergeMap(([action, connections]) => {
        if (!connections || connections.length === 0) {
          return of(actions.refreshTopicsFailed({connectionId: action.connectionId, error: 'No connections present'}))
        }
        
        const connection = connections.find(c => c.id === action.connectionId);
        if (!connection) {
          return of(actions.refreshTopicsFailed({connectionId: action.connectionId, error: `Connection with id ${action.connectionId} not found`}))
        }

        return this.topicsService.getTopics(connection)
        .pipe(
          map((result) => actions.refreshTopicsSuccess({connectionId: connection.id, topics: result})),
          catchError(error => of(actions.refreshTopicsFailed({ connectionId: connection.id, error: error as string })))
        )
      })
    )
  });
}
