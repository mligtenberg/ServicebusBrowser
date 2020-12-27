import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, first, map, mergeMap } from 'rxjs/operators';
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
    private store: Store<State>
    ) {}

    getQueueMessages$ = createEffect(() => {
      return this.actions$.pipe(
        ofType(actions.getQueueMessages),
        mergeMap((action) => {
          return this.store.select(getActiveConnectionById(action.connectionId)).pipe(
            first(),
            mergeMap(connection => {
              return from(this.messages.getQueueMessages(connection, action.queueName, action.numberOfMessages))
                .pipe(
                  map((messages: IMessage[]) =>
                    actions.getQueueMessagesSuccess({connectionId: action.connectionId, queueName: action.queueName, messages}),
                  catchError((reason) => 
                    of(actions.getQueueMessagesFailure({connectionId: action.connectionId, queueName: action.queueName, reason: reason as string})))
                  )
                );
            })
          )
        })
      )
    })
}
