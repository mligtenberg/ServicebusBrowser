import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, from } from 'rxjs';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { getActiveConnectionById, getActiveConnections, getSelectedConnection } from '../connections/ngrx/connections.selectors';
import { State } from '../ngrx.module';
import * as actions from './ngrx/queues.actions';
import { openConnection, openSelectedConnection } from '../connections/ngrx/connections.actions';
import { QueuesService } from './queues.service';
import { clearQueueMessagesSucces } from '../messages/ngrx/messages.actions';
import { MessagebarService } from '../ui/messagebar.service';

@Injectable()
export class QueuesEffects {
  constructor(
    private actions$: Actions,
    private queuesService: QueuesService,
    private store: Store<State>,
    private messagebar: MessagebarService,
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

  updateQueue$ = createEffect(() => {
    return this.actions$.pipe(
          // listen for the type of testConnection
          ofType(actions.updateQueue),
          // execute the test and return the result
          mergeMap((action) => {
            return this.store.select(getActiveConnectionById(action.connectionId)).pipe(
              mergeMap(connection => {
                return of(this.queuesService.saveQueueProperties(connection, action.queue))
                .pipe(
                  map(() => actions.updateQueueSuccesful({
                    connectionId: action.connectionId,
                    queue: action.queue
                  })),
                  catchError((reason) => of(actions.updateQueueFailed({
                    connectionId: action.connectionId,
                    queue: action.queue,
                    reason
                  })))
                );
              })
            );
          })
    );
  });

  queueUpdateSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.updateQueueSuccesful),
      map(action => this.messagebar.showMessage({
        message: `Saved queue "${action.queue.name}"`
      }))
    )
  }, {dispatch: false})

  queueUpdateFailed$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.updateQueueFailed),
      map(action => this.messagebar.showMessage({
        message: `Failed to save queue "${action.queue.name}"`
      }))
    )
  }, {dispatch: false})

  initQueuesForConnection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(openConnection),
      map(action => actions.refreshQueues({connectionId: action.connection.id}))
    )
  })

  initQueuesForNewConnection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(openSelectedConnection),
      withLatestFrom(this.store.select(getSelectedConnection)),
      map(([_, connection]) => actions.refreshQueues({connectionId: connection.id}))
    )
  })

  refreshQueuesOnClearMessages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(clearQueueMessagesSucces),
      map(action => actions.refreshQueues({connectionId: action.connectionId}))
    )
  })
}
