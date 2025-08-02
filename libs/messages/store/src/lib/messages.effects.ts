import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ServiceBusMessagesFrontendClient } from '@service-bus-browser/service-bus-electron-client';
import { catchError, EMPTY, from, map, mergeMap, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';

import * as actions from './messages.actions';
import * as internalActions from './messages.internal-actions';
import Long from 'long';
import { featureSelector } from './messages.feature-selector';
import { clearedEndpoint } from './messages.actions';

@Injectable({
  providedIn: 'root'
})
export class MessagesEffects {
  MAX_PAGE_SIZE = 500;
  store = inject(Store);
  actions$ = inject(Actions);
  messagesService = inject(ServiceBusMessagesFrontendClient);

  currentState = this.store.selectSignal(featureSelector);

  loadPeekQueueMessages$ = createEffect(() => this.actions$.pipe(
    ofType(actions.peekMessages),
    map(({ endpoint, maxAmount, fromSequenceNumber }) => internalActions.peekMessagesLoad({
      pageId: crypto.randomUUID(),
      endpoint,
      maxAmount,
      alreadyLoadedAmount: 0,
      fromSequenceNumber: fromSequenceNumber ?? '0'
    }))
  ));

  loadPeekQueueMessagesPart$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.peekMessagesLoad),
    mergeMap(({ pageId, endpoint, maxAmount, fromSequenceNumber, alreadyLoadedAmount }) => {
      const maxAmountToLoad = Math.min(maxAmount, this.MAX_PAGE_SIZE);

      const messages$ =  from(this.messagesService.peekMessages(
        endpoint, maxAmountToLoad, Long.fromString(fromSequenceNumber)));

      return messages$
        .pipe(
          map(messages => internalActions.peekMessagesPartLoaded({
              pageId,
              endpoint,
              maxAmount: maxAmount - messages.length,
              amountLoaded: alreadyLoadedAmount + messages.length,
              messages
          }))
        );
    })
  ));

  loadMoreMessages$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.peekMessagesPartLoaded),
    map(({ pageId, endpoint, maxAmount, messages, amountLoaded }) => {
      if (maxAmount <= 0 || messages.length === 0) {
        return actions.peekMessagesLoadingDone({ pageId, endpoint });
      }

      const sequenceNumbers = messages.map(m => Long.fromString(m.sequenceNumber ?? '0'));
      const highestSequenceNumber = sequenceNumbers.length === 0
        ? Long.fromNumber(0)
        : sequenceNumbers.reduce((max, current) => {
          return current.compare(max) > 0 ? current : max;
        }, sequenceNumbers[0]);

      const fromSequenceNumber = highestSequenceNumber.add(1).toString();

      return internalActions.peekMessagesLoad({
        pageId,
        endpoint,
        maxAmount,
        alreadyLoadedAmount: amountLoaded,
        fromSequenceNumber
      })
    })
  ));

  initClearEndpoint$ = createEffect(() => this.actions$.pipe(
    ofType(actions.clearEndpoint),
    map(({ endpoint, messagesToClearCount }) => {
      if (messagesToClearCount === 0) {
        return actions.clearedEndpoint({ endpoint });
      }

      return internalActions.continueClearingEndpoint({
        endpoint,
        messagesToClearCount: messagesToClearCount
      })
    })
  ));

  clearEndpoint$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.continueClearingEndpoint),
    mergeMap(({ endpoint, messagesToClearCount, lastClearRoundReceivedMessagesCount }) => {
      const receiveCount = this.MAX_PAGE_SIZE > messagesToClearCount ? this.MAX_PAGE_SIZE : messagesToClearCount;

      return from(this.messagesService.receiveMessages(
        endpoint,
        receiveCount
      )).pipe(map((messages) => {
          if (messages.length === 0 && lastClearRoundReceivedMessagesCount === 0) {
            return clearedEndpoint({ endpoint });
          }
          if ((messagesToClearCount - messages.length) <= 0) {
            return clearedEndpoint({ endpoint });
          }

          return internalActions.continueClearingEndpoint({
            endpoint,
            messagesToClearCount: messagesToClearCount - messages.length,
            lastClearRoundReceivedMessagesCount: messages.length
          });
        })
      )
    })));

  sendMessage$ = createEffect(() => this.actions$.pipe(
    ofType(actions.sendMessage),
    mergeMap(({ endpoint, message }) => from(this.messagesService.sendMessage(
      endpoint,
      message
    )).pipe(
      map(() => internalActions.sendedMessage({ endpoint, message })),
      catchError(() => [internalActions.messageSendFailed({ endpoint, message })])
    ))
  ));

  sendMessages$ = createEffect(() => this.actions$.pipe(
    ofType(actions.sendMessages),
    map(({ endpoint, messages }) => {
      return internalActions.messagesSending({
        taskId: crypto.randomUUID(),
        sendAmount: 0,
        messagesToSend: messages,
        endpoint
      })
    })
  ));

  continueSendingMessages$ = createEffect(() => this.actions$.pipe(
    ofType(internalActions.messagesSending),
    mergeMap(({ taskId, endpoint, messagesToSend, sendAmount }) => {
      const messages = messagesToSend.slice(0, 50);
      const rest = messagesToSend.slice(messages.length);

      return from(this.messagesService.sendMessages(endpoint, messages))
        .pipe(
          map(() => rest.length === 0
            ? internalActions.messagesSendSucceeded({ taskId })
            : internalActions.messagesSending({
              taskId,
              endpoint,
              messagesToSend: rest,
              sendAmount: sendAmount + messages.length,
            })
          ),
          catchError(() => [internalActions.messagesSendFailed({
            endpoint,
            messagesToSend: rest,
            sendAmount: sendAmount + 1,
            taskId
          })])
        );
    })
  ));

  exportMessages$ = createEffect(() => this.actions$.pipe(
    ofType(actions.exportMessages),
    mergeMap(({ pageName, messages }) =>
      from(this.messagesService.exportMessages(pageName, messages)).pipe(
        map(() => internalActions.messagesExported()),
        catchError(() => [internalActions.messagesExportFailed()])
      )
    )
  ), { dispatch: true });

  importMessages$ = createEffect(() => this.actions$.pipe(
    ofType(actions.importMessages),
    mergeMap(() =>
      from(this.messagesService.importMessages()).pipe(
        switchMap((action) => {
          if (action.messages.length === 0) {
            return EMPTY;
          }
          return [action]
        }),
        map(({ pageName, messages }) => internalActions.messagesImported({ pageName, messages })),
        catchError(() => [internalActions.messagesImportFailed()])
      )
    )
  ), { dispatch: true });
}
