import { createFeature, createReducer, on } from '@ngrx/store';
import { MessagePage, ServiceBusMessage } from '@service-bus-browser/messages-contracts';
import * as actions from './messages.actions';
import * as internalActions from './messages.internal-actions';

export const featureKey = 'messages';

export type MessagesState = {
  receivedMessages: Array<MessagePage>;
  messageForBatchResend: Array<ServiceBusMessage>;
}

export const initialState: MessagesState = {
  receivedMessages: [],
  messageForBatchResend: []
};

export const logsReducer = createReducer(
  initialState,
  on(internalActions.pageCreated, (state, { pageId, pageName, loadedFromDb }): MessagesState => {
    const page = state.receivedMessages.find(page => page.id === pageId);
    if (page) {
      return state;
    }

    return {
      ...state,
      receivedMessages: [
        ...state.receivedMessages,
        {
          id: pageId,
          name: pageName,
          retrievedAt: new Date(),
          loaded: loadedFromDb
        }
      ]
    }
  }),
  on(actions.peekMessagesLoadingDone, (state, { pageId }): MessagesState => {

    return {
      ...state,
      receivedMessages: state.receivedMessages.map(page => page.id === pageId ? {
        ...page,
        loaded: true
      } : page)
    }
  }),
  on(actions.closePage, (state, { pageId }): MessagesState => {
    return {
      ...state,
      receivedMessages: state.receivedMessages.filter(page => page.id !== pageId)
    }
  }),
  on(internalActions.messagesImported, (state, { pageId, pageName }): MessagesState => {
    return {
      ...state,
      receivedMessages: [
        ...state.receivedMessages,
        {
          id: pageId,
          name: `Imported: ${pageName}`,
          retrievedAt: new Date(),
          loaded: true
        }
      ]
    }
  }),
  on(actions.setBatchResendMessages, (state, { messages }): MessagesState => {
    return {
      ...state,
      messageForBatchResend: messages
    }
  }),
  on(actions.setPageFilter, (state, { pageId, filter }): MessagesState => {
    return {
      ...state,
      receivedMessages: state.receivedMessages.map(page => page.id === pageId ? { ...page, filter } : page)
    }
  }),
  on(actions.setPageSelection, (state, { pageId, sequenceNumbers }): MessagesState => {
    return {
      ...state,
      receivedMessages: state.receivedMessages.map(page => page.id === pageId ? {
        ...page,
        selectedMessageSequences: sequenceNumbers
      } : page)
    }
  })
);

export const feature = createFeature({
  name: featureKey,
  reducer: logsReducer
});
