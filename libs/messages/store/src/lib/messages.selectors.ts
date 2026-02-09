import { createSelector } from '@ngrx/store';
import { featureSelector } from './messages.feature-selector';
import { Page } from '@service-bus-browser/shared-contracts';
import { ServiceBusReceivedMessage } from '@azure/service-bus';

export const selectPages = createSelector(
  featureSelector,
  (state) =>
    state.receivedMessages.map((page) => ({
      id: page.id,
      name: page.name,
      messages: page.messages,
      type: 'messages',
    })) as Array<Page & { messages: ServiceBusReceivedMessage[] }>,
);

export const selectPage = (pageId: string) =>
  createSelector(featureSelector, (state) =>
    state.receivedMessages.find((page) => page.id === pageId),
  );

export const selectPageSelectedMessages = (pageId: string) =>
  createSelector(selectPage(pageId), (page) =>
    page?.selectedMessageSequences === undefined
      ? undefined
      : page.messages.filter(
          (message) => message.sequenceNumber ? page.selectedMessageSequences!.includes(message.sequenceNumber) : false,
        ),
  );

export const selectMessage = (pageId: string, messageId: string) =>
  createSelector(selectPage(pageId), (page) =>
    page?.messages.find((message) => message.messageId === messageId),
  );

export const selectBatchResendMessages = createSelector(
  featureSelector,
  (state) => state.messageForBatchResend,
);
