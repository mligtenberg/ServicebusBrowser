import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, from, map, of, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';

import { TopologyActions } from '@service-bus-browser/topology-store';
import { messagePagesActions, messagesActions } from './messages.actions';
import { LoadMessagesUtil } from './load-messages-util';
import { messagePagesEffectActions, messagesEffectActions } from './messages.effect-actions';
import { ResendMessagesUtil } from './resend-messages-util';
import { MessagesFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';

@Injectable({
  providedIn: 'root',
})
export class MessagesEffects {
  store = inject(Store);
  actions$ = inject(Actions);
  loadMessagesUtil = inject(LoadMessagesUtil);
  resendMessageUtil = inject(ResendMessagesUtil);
  messagesClient = inject(MessagesFrontendClient);

  loadMessages$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(messagesActions.loadMessagesFromEndpoint),
        switchMap(({ endpoint, options }) => {
          return this.loadMessagesUtil.loadMessages(endpoint, options);
        }),
      ),
    { dispatch: false },
  );

  clearMessages$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(messagesActions.clearEndpoint),
        switchMap(({ endpoint }) => {
          return this.loadMessagesUtil.clearMessages(endpoint);
        }),
      ),
    { dispatch: false },
  );

  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(messagesActions.sendMessage),
      switchMap(({ endpoint, message }) => {
        const { bodyBase64, ...rest } = message;

        const body = (Uint8Array as any).fromBase64(bodyBase64);

        const messageToSend = { ...rest, body: body };
        return from(
          this.messagesClient.sendMessage(endpoint, messageToSend),
        ).pipe(
          map(() => messagesEffectActions.messageSent({ endpoint })),
          catchError((err) =>
            of(
              messagesEffectActions.failedToSendMessage({
                endpoint,
                error: err instanceof Error ? err : new Error(err?.toString()),
              }),
            ),
          ),
        );
      }),
    ),
  );

  resendMessages$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(messagePagesActions.resendMessages),
        switchMap(
          ({
            endpoint,
            pageId,
            messageFilter,
            modificationActions,
            selectionKeys,
          }) => {
            return this.resendMessageUtil.resendMessages(
              endpoint,
              pageId,
              messageFilter,
              selectionKeys,
              modificationActions,
            );
          },
        ),
      ),
    { dispatch: false },
  );

  reloadOnMessagedReceived$ = createEffect(() =>
    this.actions$.pipe(
      ofType(messagePagesEffectActions.pageLoaded),
      filter(({ endpoint }) => !!endpoint),
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
      map(({ endpoint }) => TopologyActions.reloadSendEndpoint({ endpoint })),
    ),
  );

  reloadEndpointAfterClear$ = createEffect(() =>
    this.actions$.pipe(
      ofType(messagesEffectActions.clearedEndpoint),
      map(({ endpoint }) =>
        TopologyActions.reloadReceiveEndpoint({ endpoint }),
      ),
    ),
  );
}
