import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { State } from '../ngrx.module';
import { TopicsService } from './topics.service';
import * as actions from './ngrx/topics.actions';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { getActiveConnectionById, getActiveConnections, getSelectedConnection } from '../connections/ngrx/connections.selectors';
import { of, from } from 'rxjs';
import { openConnection, openSelectedConnection } from '../connections/ngrx/connections.actions';
import { clearSubscriptionMessagesSuccesfull, sendMessagesSuccess } from '../messages/ngrx/messages.actions';
import { MessagebarService } from '../ui/messagebar.service';

@Injectable()
export class TopicsEffects {
  constructor(
    private actions$: Actions,
    private topicsService: TopicsService,
    private store: Store<State>,
    private messagebar: MessagebarService,
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
          return of(actions.refreshTopicsFailed({connectionId: action.connectionId, error: 'No connections present'}));
        }

        const connection = connections.find(c => c.id === action.connectionId);
        if (!connection) {
          return of(actions.refreshTopicsFailed({connectionId: action.connectionId, error: `Connection with id ${action.connectionId} not found`}));
        }

        return from(this.topicsService.getTopics(connection))
        .pipe(
          map((result) => actions.refreshTopicsSuccess({connectionId: connection.id, topics: result})),
          catchError(error => of(actions.refreshTopicsFailed({ connectionId: connection.id, error: error as string })))
        );
      })
    );
  });

  updateTopic$ = createEffect(() => {
    return this.actions$.pipe(
          ofType(actions.updateTopic),
          mergeMap((action) => {
            return this.store.select(getActiveConnectionById(action.connectionId)).pipe(
              mergeMap(connection => {
                return of(this.topicsService.updateTopic(connection, action.topic))
                .pipe(
                  map(() => actions.updateTopicSuccesful({
                    connectionId: action.connectionId,
                    topic: action.topic
                  })),
                  catchError((reason) => of(actions.updateTopicFailed({
                    connectionId: action.connectionId,
                    topic: action.topic,
                    reason
                  })))
                );
              })
            );
          })
    );
  });

  topicUpdateSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.updateTopicSuccesful),
      map(action => this.messagebar.showMessage({
        message: `Saved topic "${action.topic.name}"`
      }))
    );
  }, {dispatch: false});

  topicUpdateFailed$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.updateTopicFailed),
      map(action => this.messagebar.showMessage({
        message: `Failed to save topic "${action.topic.name}"`
      }))
    );
  }, {dispatch: false});

  initTopicsForConnection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(openConnection),
      map(action => actions.refreshTopics({connectionId: action.connection.id}))
    );
  });

  initTopicsForNewConnection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(openSelectedConnection),
      withLatestFrom(this.store.select(getSelectedConnection)),
      map(([_, connection]) => actions.refreshTopics({connectionId: connection.id}))
    );
  });

  refreshTopicsWhenMessageSendSuccesfull$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(sendMessagesSuccess),
      map(action => actions.refreshTopics({connectionId: action.connectionId}))
    );
  });
}
