import { createSelector } from '@ngrx/store';
import { featureSelector } from './messages.feature-selector';
import { Page, UUID } from '@service-bus-browser/shared-contracts';
import { ServiceBusReceivedMessage } from '@azure/service-bus';

export const selectPages = createSelector(
  featureSelector,
  (state) =>
    state.receivedMessages.map((page) => ({
      id: page.id,
      name: page.loaded ? page.name : page.name + ' (loading)',
      type: 'messages',
    })) as Array<Page & { messages: ServiceBusReceivedMessage[] }>,
);

export const selectPage = (pageId: string) =>
  createSelector(featureSelector, (state) =>
    state.receivedMessages.find((page) => page.id === pageId),
  );

export const selectIsTransactionRunning = (transactionId: UUID) => createSelector(featureSelector,
  (state) => state.runningBatchSendTasks.some(t => t === transactionId));
