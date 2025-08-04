import { createFeature, createReducer, on } from '@ngrx/store';
import { MessagePage, ServiceBusMessage } from '@service-bus-browser/messages-contracts';

export const featureKey = 'messages';

import * as actions from './messages.actions';
import * as internalActions from './messages.internal-actions';

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
  on(internalActions.peekMessagesLoad, (state, { pageId, endpoint }): MessagesState => {
    const page = state.receivedMessages.find(page => page.id === pageId);
    if (page) {
      return state;
    }

    let name = 'queueName' in endpoint ? endpoint.queueName : `${endpoint.topicName}/${endpoint.subscriptionName}`;
    if (endpoint.channel) {
      name += ` (${endpoint.channel})`;
    }

    return {
      ...state,
      receivedMessages: [
        ...state.receivedMessages,
        {
          id: pageId,
          name: `${name} (loading...)`,
          retrievedAt: new Date(),
          loaded: false,
          messages: []
        }
      ]
    }
  }),
  on(internalActions.peekMessagesPartLoaded, (state, { pageId, messages }): MessagesState => {
    const page = state.receivedMessages.find(page => page.id === pageId);
    if (!page) {
      return state;
    }

    return {
      ...state,
      receivedMessages: state.receivedMessages.map(page => page.id === pageId ? { ...page, messages: [
        ...page.messages,
          ...messages
        ] } : page)
    };
  }),
  on(actions.peekMessagesLoadingDone, (state, { pageId }): MessagesState => {

    return {
      ...state,
      receivedMessages: state.receivedMessages.map(page => page.id === pageId ? {
        ...page,
        name: page.name.replace(' (loading...)', ` (${page?.messages[0]?.sequenceNumber ?? '0'} - ${page?.messages[page.messages.length - 1]?.sequenceNumber ?? '0'})`),
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
  on(internalActions.messagesImported, (state, { pageName, messages }): MessagesState => {
    const pageId = crypto.randomUUID();

    return {
      ...state,
      receivedMessages: [
        ...state.receivedMessages,
        {
          id: pageId,
          name: `Imported: ${pageName}`,
          retrievedAt: new Date(),
          loaded: true,
          messages
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
  })
);

export const feature = createFeature({
  name: featureKey,
  reducer: logsReducer
});
