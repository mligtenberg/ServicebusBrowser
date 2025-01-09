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
  MAX_PAGE_SIZE = 100;
  actions = inject(Actions);
  messagesService = inject(ServiceBusMessagesElectronClient);

  loadPeakQueueMessages$ = createEffect(() => this.actions.pipe(
    ofType(actions.peakMessages),
    map(({ connectionId, endpoint, maxAmount }) => internalActions.peakMessagesLoad({
      connectionId,
      pageId: crypto.randomUUID(),
      endpoint,
      maxAmount,
      fromSequenceNumber: '0'
    }))
  ));

  loadPeakQueueMessagesPart$ = createEffect(() => this.actions.pipe(
    ofType(internalActions.peakMessagesLoad),
    switchMap(({ connectionId, pageId, endpoint, maxAmount, fromSequenceNumber }) => {
      const maxAmountToLoad = Math.min(maxAmount, this.MAX_PAGE_SIZE);

      const messages$ = 'queueName' in endpoint
        ? from(this.messagesService.peakFromQueue(connectionId, endpoint.queueName, maxAmountToLoad, Long.fromString(fromSequenceNumber)))
        : from(this.messagesService.peakFromSubscription(connectionId, endpoint.topicName, endpoint.subscriptionName, maxAmountToLoad, Long.fromString(fromSequenceNumber)));

      return messages$
        .pipe(
          map(messages => messages.length === 0
            ? internalActions.peakMessagesLoadingDone({ connectionId, pageId, endpoint })
            : internalActions.peakMessagesPartLoaded({
              connectionId,
              pageId,
              endpoint,
              maxAmount: maxAmount - messages.length,
              amountLoaded: messages.length,
              messages
          }))
        );
    })
  ));

  loadMoreMessages$ = createEffect(() => this.actions.pipe(
    ofType(internalActions.peakMessagesPartLoaded),
    map(({ connectionId, pageId, endpoint, maxAmount, messages }) => {
      const sequenceNumbers = messages.map(m => Long.fromString(m.sequenceNumber ?? '0'));
      const highestSequenceNumber = sequenceNumbers.length === 0
        ? Long.fromNumber(0)
        : sequenceNumbers.reduce((max, current) => {
          return current.compare(max) > 0 ? current : max;
        }, sequenceNumbers[0]);

      const fromSequenceNumber = highestSequenceNumber.add(1).toString();

      return internalActions.peakMessagesLoad({
        connectionId,
        pageId,
        endpoint,
        maxAmount,
        fromSequenceNumber
      })
    })
  ));
}
