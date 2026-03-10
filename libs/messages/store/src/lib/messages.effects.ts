import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { filter, map, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';

import { TopologyActions } from '@service-bus-browser/topology-store';
import { messagePagesActions, messagesActions } from './messages.actions';
import { LoadMessagesUtil } from './load-messages-util';
import { messagePagesEffectActions, messagesEffectActions } from './messages.effect-actions';
import { ResendMessagesUtil } from './resend-messages-util';

@Injectable({
  providedIn: 'root',
})
export class MessagesEffects {
  MAX_PAGE_SIZE = 500;
  store = inject(Store);
  actions$ = inject(Actions);
  loadMessagesUtil = inject(LoadMessagesUtil);
  resendMessageUtil = inject(ResendMessagesUtil);

  loadActions$ = createEffect(() => this.actions$.pipe(
    ofType(messagesActions.loadMessagesFromEndpoint),
    switchMap(({ endpoint, options }) => {
      return this.loadMessagesUtil.loadMessages(endpoint, options);
    })
  ), { dispatch: false });

  resendMessages$ = createEffect(() => this.actions$.pipe(
    ofType(messagePagesActions.resendMessages),
    switchMap(({
                 endpoint,
                 pageId,
                 messageFilter,
                 modificationActions,
                 selectionKeys
    }) => {
      return this.resendMessageUtil.resendMessages(
        endpoint,
        pageId,
        messageFilter,
        selectionKeys,
        modificationActions
      );
    })
  ), { dispatch: false });

  reloadOnMessagedReceived$ = createEffect(() =>
    this.actions$.pipe(
      ofType(messagePagesEffectActions.pageLoaded),
      filter(({ endpoint}) => !!endpoint),
      map(({ endpoint }) => {
        return TopologyActions.reloadReceiveEndpoint({ endpoint: endpoint! });
      }),
    ),
  );

  reloadEndpointAfterSent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(messagesEffectActions.messageSent),
      map(({ endpoint }) => TopologyActions.reloadSendEndpoint({ endpoint })),
    ),
  );

  reloadEndpointAfterBatchSent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(messagePagesEffectActions.messagesResent),
      map(({ endpoint }) =>
        TopologyActions.reloadSendEndpoint({ endpoint }),
      ),
    ),
  );

  reloadEndpointAfterClear$ = createEffect(() =>
    this.actions$.pipe(
      ofType(messagesEffectActions.clearedEndpoint),
      map(({ endpoint }) => TopologyActions.reloadReceiveEndpoint({ endpoint })),
    ),
  );
}
