import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, first, map, mergeMap, tap } from 'rxjs/operators';
import { IMessage } from '../../../../ipcModels';
import { getActiveConnectionById } from '../connections/ngrx/connections.selectors';
import { State } from '../ngrx.module';
import { MessagesService } from './messages.service';
import * as actions from './ngrx/messages.actions';

@Injectable()
export class MessagesEffects {
  constructor(
    private actions$: Actions,
    private messages: MessagesService,
    private store: Store<State>,
    private router: Router
  ) {}

  getQueueMessages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.getQueueMessages),
      mergeMap((action) => {
        return this.store
          .select(getActiveConnectionById(action.connectionId))
          .pipe(
            first(),
            mergeMap((connection) => {
              return from(
                this.messages.getQueueMessages(
                  connection,
                  action.queueName,
                  action.numberOfMessages,
                  action.channel
                )
              ).pipe(
                map(
                  (messages: IMessage[]) =>
                    actions.getQueueMessagesSuccess({
                      connectionId: action.connectionId,
                      queueName: action.queueName,
                      channel: action.channel,
                      messages,
                    }),
                  catchError((reason) =>
                    of(
                      actions.getQueueMessagesFailure({
                        connectionId: action.connectionId,
                        queueName: action.queueName,
                        channel: action.channel,
                        reason: reason as string,
                      })
                    )
                  )
                )
              );
            })
          );
      })
    );
  });

  getQueueMessagesSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(actions.getQueueMessagesSuccess),
        tap(() => this.router.navigateByUrl('/messages/view'))
      );
    },
    { dispatch: false }
  );

  getSubscriptionMessages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.getSubscriptionMessages),
      mergeMap((action) => {
        return this.store
          .select(getActiveConnectionById(action.connectionId))
          .pipe(
            first(),
            mergeMap((connection) => {
              return from(
                this.messages.getSubscriptionMessages(
                  connection,
                  action.topicName,
                  action.subscriptionName,
                  action.numberOfMessages,
                  action.channel
                )
              ).pipe(
                map(
                  (messages: IMessage[]) =>
                    actions.getSubscriptionMessagesSuccess({
                      connectionId: action.connectionId,
                      topicName: action.topicName,
                      subscriptionName: action.subscriptionName,
                      channel: action.channel,
                      messages,
                    }),
                  catchError((reason) =>
                    of(
                      actions.getSubscriptionMessagesFailure({
                        connectionId: action.connectionId,
                        topicName: action.topicName,
                        subscriptionName: action.subscriptionName,
                        channel: action.channel,
                        reason: reason as string,
                      })
                    )
                  )
                )
              );
            })
          );
      })
    );
  });

  getSubscriptionSuccess$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(actions.getSubscriptionMessagesSuccess),
        tap(() => this.router.navigateByUrl('/messages/view'))
      );
    },
    { dispatch: false }
  );
}
