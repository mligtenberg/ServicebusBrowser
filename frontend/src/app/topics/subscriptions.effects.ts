import { Injectable } from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {SubscriptionsService} from './subscriptions.service';
import {Store} from '@ngrx/store';
import {State} from '../ngrx.module';
import {MessagebarService} from '../ui/messagebar.service';
import * as actions from './ngrx/topics.actions';
import {catchError, map, mergeMap, withLatestFrom} from 'rxjs/operators';
import {getActiveConnectionById, getActiveConnections} from '../connections/ngrx/connections.selectors';
import {from, of} from 'rxjs';
import {clearSubscriptionMessagesSuccesfull} from '../messages/ngrx/messages.actions';



@Injectable()
export class SubscriptionsEffects {
  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private subscriptionsService: SubscriptionsService,
    private messagebar: MessagebarService,
  ) {}

  getSubscriptions$ = createEffect(() => {
    return this.actions$.pipe(
      // listen for the type of testConnection
      ofType(actions.refreshSubscriptions),
      // retreive the currently selected connection
      withLatestFrom(this.store.select(getActiveConnections)),

      // execute the test and return the result
      mergeMap(([action, connections]) => {
        if (!connections || connections.length === 0) {
          return of(actions.refreshSubscriptionsFailed({connectionId: action.connectionId, topicName: action.topicName, reason: 'No connections present'}));
        }

        const connection = connections.find(c => c.id === action.connectionId);
        if (!connection) {
          return of(actions.refreshSubscriptionsFailed({connectionId: action.connectionId, topicName: action.topicName, reason: `Connection with id ${action.connectionId} not found`}));
        }

        return from(this.subscriptionsService.getTopicSubscriptions(connection, action.topicName))
          .pipe(
            map((result) => actions.refreshSubscriptionsSuccess(
              {connectionId: connection.id, topicName: action.topicName, subscriptions: result})),
            catchError(error => of(actions.refreshSubscriptionsFailed(
              { connectionId: connection.id, topicName: action.topicName, reason: error as string })))
          );
      })
    );
  });

  updateSubscriptions$ = createEffect(() => {
    return this.actions$.pipe(
      // listen for the type of testConnection
      ofType(actions.updateSubscription),
      mergeMap((action) => {
        return this.store.select(getActiveConnectionById(action.connectionId)).pipe(
          mergeMap(connection => {
            return of(this.subscriptionsService.updateSubscription(connection, action.topicName, action.subscription))
              .pipe(
                map(() => actions.updateSubscriptionSuccesful({
                  connectionId: action.connectionId,
                  topicName: action.topicName,
                  subscription: action.subscription
                })),
                catchError((reason) => of(actions.updateSubscriptionFailed({
                  connectionId: action.connectionId,
                  topicName: action.topicName,
                  subscription: action.subscription,
                  reason
                })))
              );
          })
        );
      })
    );
  });

  subscriptionUpdateSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.updateSubscriptionSuccesful),
      map(action => this.messagebar.showMessage({
        message: `Saved subscription "${action.topicName}/${action.subscription.name}"`
      }))
    );
  }, {dispatch: false});

  subscriptionUpdateFailed$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.updateSubscriptionFailed),
      map(action => this.messagebar.showMessage({
        message: `Failed to save subscription "${action.topicName}/${action.subscription.name}"`
      }))
    );
  }, {dispatch: false});

  initSubscriptionsForTopic$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.refreshTopicsSuccess),
      mergeMap(action => {
        return action.topics.map(t => actions.refreshSubscriptions({ connectionId: action.connectionId, topicName: t.name }));
      }));
  });

  refreshSubscriptionsForTopicOnClear$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(clearSubscriptionMessagesSuccesfull),
      map(action => {
        return actions.refreshSubscriptions({ connectionId: action.connectionId, topicName: action.topicName });
      }));
  });
}
