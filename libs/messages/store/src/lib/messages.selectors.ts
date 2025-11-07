import { createSelector } from '@ngrx/store';
import { featureSelector } from './messages.feature-selector';

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

export const selectMessage = (pageId: string, messageId: string) => createSelector(
  selectPage(pageId),
  (page) => page?.messages.find((message) => message.messageId === messageId)
);

export const selectBatchResendMessages = createSelector(
  featureSelector,
  (state) => state.messageForBatchResend
);

// Send Message Page selectors
export const selectSendMessagePages = createSelector(
  featureSelector,
  (state) => state.sendMessagePages.map(
    (page) => ({
      id: page.id,
      name: page.name
    })
  )
);

export const selectSendMessagePage = (pageId: string) => createSelector(
  featureSelector,
  (state) => state.sendMessagePages.find((page) => page.id === pageId)
);

// Batch Resend Page selectors
export const selectBatchResendPages = createSelector(
  featureSelector,
  (state) => state.batchResendPages.map(
    (page) => ({
      id: page.id,
      name: page.name
    })
  )
);

export const selectBatchResendPage = (pageId: string) => createSelector(
  featureSelector,
  (state) => state.batchResendPages.find((page) => page.id === pageId)
);
