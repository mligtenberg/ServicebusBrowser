import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ServiceBusMessagesElectronClient } from '@service-bus-browser/service-bus-electron-client';
import { from, map, switchMap } from 'rxjs';

import * as actions from './messages.actions';
import * as internalActions from './messages.internal-actions';
import Long from 'long';

@Injectable({
  providedIn: 'root'
})
export class MessagesEffects {
  MAX_PAGE_SIZE = 500;
  actions = inject(Actions);
  messagesService = inject(ServiceBusMessagesElectronClient);

  loadPeakQueueMessages$ = createEffect(() => this.actions.pipe(
    ofType(actions.peakMessages),
    map(({ endpoint, maxAmount, fromSequenceNumber }) => internalActions.peakMessagesLoad({
      pageId: crypto.randomUUID(),
      endpoint,
      maxAmount,
      alreadyLoadedAmount: 0,
      fromSequenceNumber: fromSequenceNumber ?? '0'
    }))
  ));

  loadPeakQueueMessagesPart$ = createEffect(() => this.actions.pipe(
    ofType(internalActions.peakMessagesLoad),
    switchMap(({ pageId, endpoint, maxAmount, fromSequenceNumber, alreadyLoadedAmount }) => {
      const maxAmountToLoad = Math.min(maxAmount, this.MAX_PAGE_SIZE);

      const messages$ =  from(this.messagesService.peakMessages(
        endpoint, maxAmountToLoad, Long.fromString(fromSequenceNumber)));

      return messages$
        .pipe(
          map(messages => internalActions.peakMessagesPartLoaded({
              pageId,
              endpoint,
              maxAmount: maxAmount - messages.length,
              amountLoaded: alreadyLoadedAmount + messages.length,
              messages
          }))
        );
    })
  ));

  loadMoreMessages$ = createEffect(() => this.actions.pipe(
    ofType(internalActions.peakMessagesPartLoaded),
    map(({ pageId, endpoint, maxAmount, messages, amountLoaded }) => {
      if (maxAmount <= 0 || messages.length === 0) {
        return actions.peakMessagesLoadingDone({ pageId, endpoint });
      }

      const sequenceNumbers = messages.map(m => Long.fromString(m.sequenceNumber ?? '0'));
      const highestSequenceNumber = sequenceNumbers.length === 0
        ? Long.fromNumber(0)
        : sequenceNumbers.reduce((max, current) => {
          return current.compare(max) > 0 ? current : max;
        }, sequenceNumbers[0]);

      const fromSequenceNumber = highestSequenceNumber.add(1).toString();

      return internalActions.peakMessagesLoad({
        pageId,
        endpoint,
        maxAmount,
        alreadyLoadedAmount: amountLoaded,
        fromSequenceNumber
      })
    })
  ));

  clearEndpoint$ = createEffect(() => this.actions.pipe(
    ofType(actions.clearEndpoint, internalActions.continueClearingEndpoint),
    switchMap(({ endpoint }) => from(this.messagesService.receiveMessages(
      endpoint,
      this.MAX_PAGE_SIZE
    )).pipe(map((messages) => messages.length === 0
        ? actions.clearedEndpoint({ endpoint })
        : internalActions.continueClearingEndpoint({ endpoint }))),
    )));
}
