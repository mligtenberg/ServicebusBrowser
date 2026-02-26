import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ServiceBusMessagesFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { catchError, filter, from, map, mergeMap } from 'rxjs';
import { Store } from '@ngrx/store';

import * as actions from './messages.actions';
import * as internalActions from './messages.internal-actions';
import Long from 'long';
import { clearedEndpoint, importMessages } from './messages.actions';
import { ServiceBusMessage } from '@service-bus-browser/messages-contracts';
import { batchSendCompleted } from './messages.internal-actions';
import { ExportMessagesUtil } from './export-messages-util';
import { getMessagesRepository } from '@service-bus-browser/messages-db';
import { TopologyActions } from '@service-bus-browser/topology-store';

const repository = await getMessagesRepository();

@Injectable({
  providedIn: 'root',
})
export class MessagesEffects {
  MAX_PAGE_SIZE = 500;
  store = inject(Store);
  actions$ = inject(Actions);
  messagesService = inject(ServiceBusMessagesFrontendClient);
  exportMessagesUtil = inject(ExportMessagesUtil);

  loadPeekQueueMessagesPart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(internalActions.loadMessagesLoad),
      mergeMap(
        ({
          pageId,
          endpoint,
          maxAmount,
          fromSequenceNumber,
          alreadyLoadedAmount,
          receiveType,
        }) => {
          const maxAmountToLoad = Math.min(maxAmount, this.MAX_PAGE_SIZE);

          const messages$ =
            receiveType === 'peek'
              ? from(
                  this.messagesService.peekMessages(
                    endpoint,
                    maxAmountToLoad,
                    Long.fromString(fromSequenceNumber),
                  ),
                )
              : from(
                  this.messagesService.receiveMessages(
                    endpoint,
                    maxAmountToLoad,
                  ),
                );

          return messages$.pipe(
            map((messages) =>
              internalActions.loadMessagesPartLoaded({
                pageId,
                endpoint,
                maxAmount: maxAmount - messages.length,
                amountLoaded: alreadyLoadedAmount + messages.length,
                messages,
                receiveType: receiveType,
              }),
            ),
          );
        },
      ),
    ),
  );

  loadMoreMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(internalActions.loadMessagesPartLoaded),
      mergeMap((action) => {
        return from(
          repository.addMessages(action.pageId, action.messages),
        ).pipe(map(() => action));
      }),
      map(
        ({
          pageId,
          endpoint,
          maxAmount,
          messages,
          amountLoaded,
          receiveType,
        }) => {
          if (maxAmount <= 0 || messages.length === 0) {
            return actions.loadMessagesLoadingDone({
              pageId,
              endpoint,
              receiveType,
            });
          }

          const sequenceNumbers = messages.map((m) =>
            Long.fromString(m.sequenceNumber ?? '0'),
          );
          const highestSequenceNumber =
            sequenceNumbers.length === 0
              ? Long.fromNumber(0)
              : sequenceNumbers.reduce((max, current) => {
                  return current.compare(max) > 0 ? current : max;
                }, sequenceNumbers[0]);

          const fromSequenceNumber = highestSequenceNumber.add(1).toString();

          return internalActions.loadMessagesLoad({
            pageId,
            endpoint,
            maxAmount,
            alreadyLoadedAmount: amountLoaded,
            fromSequenceNumber,
            receiveType,
          });
        },
      ),
    ),
  );

  initClearEndpoint$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.clearEndpoint),
      map(({ endpoint, messagesToClearCount }) => {
        if (messagesToClearCount === 0) {
          return actions.clearedEndpoint({ endpoint });
        }

        return internalActions.continueClearingEndpoint({
          endpoint,
          messagesToClearCount: messagesToClearCount,
        });
      }),
    ),
  );

  clearEndpoint$ = createEffect(() =>
    this.actions$.pipe(
      ofType(internalActions.continueClearingEndpoint),
      mergeMap(
        ({
          endpoint,
          messagesToClearCount,
          lastClearRoundReceivedMessagesCount,
        }) => {
          const receiveCount =
            this.MAX_PAGE_SIZE > messagesToClearCount
              ? this.MAX_PAGE_SIZE
              : messagesToClearCount;

          return from(
            this.messagesService.receiveMessages(endpoint, receiveCount),
          ).pipe(
            map((messages) => {
              if (
                messages.length === 0 &&
                lastClearRoundReceivedMessagesCount === 0
              ) {
                return clearedEndpoint({ endpoint });
              }
              if (messagesToClearCount - messages.length <= 0) {
                return clearedEndpoint({ endpoint });
              }

              return internalActions.continueClearingEndpoint({
                endpoint,
                messagesToClearCount: messagesToClearCount - messages.length,
                lastClearRoundReceivedMessagesCount: messages.length,
              });
            }),
          );
        },
      ),
    ),
  );

  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sendMessage),
      mergeMap(({ endpoint, message }) =>
        from(this.messagesService.sendMessage(endpoint, message)).pipe(
          map(() => internalActions.sentMessage({ endpoint, message })),
          catchError(() => [
            internalActions.messageSendFailed({ endpoint, message }),
          ]),
        ),
      ),
    ),
  );

  sendMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sendMessages),
      map(({ endpoint, messages }) => {
        return internalActions.messagesSending({
          taskId: crypto.randomUUID(),
          sendAmount: 0,
          messagesToSend: messages,
          endpoint,
        });
      }),
    ),
  );

  continueSendingMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(internalActions.messagesSending),
      mergeMap(({ taskId, endpoint, messagesToSend, sendAmount }) => {
        const messages = messagesToSend.slice(0, 50);
        const rest = messagesToSend.slice(messages.length);

        return from(this.messagesService.sendMessages(endpoint, messages)).pipe(
          map(() =>
            rest.length === 0
              ? internalActions.messagesSendSucceeded({ taskId })
              : internalActions.messagesSending({
                  taskId,
                  endpoint,
                  messagesToSend: rest,
                  sendAmount: sendAmount + messages.length,
                }),
          ),
          catchError(() => [
            internalActions.messagesSendFailed({
              endpoint,
              messagesToSend: rest,
              sendAmount: sendAmount + 1,
              taskId,
            }),
          ]),
        );
      }),
    ),
  );

  sendBatchMessages = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sendPartialBatch),
      mergeMap(({ transactionId, endpoint, messages }) => {
        const numberOfSetsNeeded = Math.ceil(messages.length / 50);
        const sets: ServiceBusMessage[][] = [];
        for (let i = 0; i < numberOfSetsNeeded; i++) {
          sets.push(messages.slice(i * 50, (i + 1) * 50));
        }
        return from(
          (async () => {
            for (const set of sets) {
              await this.messagesService.sendMessages(endpoint, set);
            }
          })(),
        ).pipe(map(() => batchSendCompleted({
          transactionId,
          endpoint
        })));
      }),
    ),
  );

  exportMessages$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actions.exportMessages),
        mergeMap(({ pageId, filter, selection }) =>
          from(
            this.exportMessagesUtil.exportMessages(pageId, filter, selection),
          ).pipe(
            map(() =>
              internalActions.messagesExported({
                pageId,
              }),
            ),
            catchError((e) => {
              console.error(e);
              return [internalActions.messagesExportFailed({ error: e })];
            }),
          ),
        ),
      ),
    { dispatch: true },
  );

  importMessages$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(importMessages),
        mergeMap(() => this.exportMessagesUtil.importMessages()),
      ),
    { dispatch: false },
  );

  reloadOnMessagedReceived$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadMessagesLoadingDone),
      filter(({ receiveType }) => receiveType === 'receive'),
      map(({ endpoint }) => {
        return TopologyActions.reloadReceiveEndpoint({ endpoint });
      }),
    ),
  );

  reloadEndpointAfterSent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(internalActions.sentMessage),
      map(({ endpoint }) => TopologyActions.reloadSendEndpoint({ endpoint })),
    ),
  );

  reloadEndpointAfterBatchSent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(batchSendCompleted),
      map(({ endpoint }) =>
        TopologyActions.reloadSendEndpoint({ endpoint }),
      ),
    ),
  );

  reloadEndpointAfterClear$ = createEffect(() =>
    this.actions$.pipe(
      ofType(clearedEndpoint),
      map(({ endpoint }) => TopologyActions.reloadReceiveEndpoint({ endpoint })),
    ),
  );
}
