import { createSelector } from '@ngrx/store';
import { featureSelector } from './messages.feature-selector';
import { UUID } from '@service-bus-browser/shared-contracts';

export const selectPages = createSelector(
  featureSelector,
  (state) => state.receivedMessages,
);

export const selectPage = (pageId: UUID) =>
  createSelector(featureSelector, (state) =>
    state.receivedMessages.find((page) => page.id === pageId),
  );

export const selectPageSelection = (pageId: UUID) => createSelector(
  featureSelector,
  (state) => state.selectionPerPage[pageId]
);

export const selectIsTransactionRunning = (transactionId: UUID) => createSelector(featureSelector,
  (state) => state.runningBatchSendTasks.some(t => t === transactionId));
