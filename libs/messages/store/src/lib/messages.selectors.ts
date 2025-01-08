import { createFeatureSelector, createSelector } from '@ngrx/store';
import { featureKey, MessagesState } from './messages.store';

const featureSelector = createFeatureSelector<MessagesState>(featureKey);

export const selectPages = createSelector(
  featureSelector,
  (state) => state.receivedMessages.map(
    (page) => ({
      id: page.id,
      name: page.name,
      messages: page.messages
    })
  )
)

export const selectPage = (pageId: string) => createSelector(
  featureSelector,
  (state) => state.receivedMessages.find((page) => page.id === pageId)
);
