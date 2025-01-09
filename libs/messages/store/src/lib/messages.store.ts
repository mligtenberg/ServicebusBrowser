import { createFeature, createReducer, on } from '@ngrx/store';
import { MessagePage } from '@service-bus-browser/messages-contracts';

export const featureKey = 'messages';

import * as actions from './messages.actions';
import * as internalActions from './messages.internal-actions';

export type MessagesState = {
  receivedMessages: Array<MessagePage>;
}

export const initialState: MessagesState = {
  receivedMessages: []
};

export const logsReducer = createReducer(
  initialState,
  on(internalActions.peakMessagesLoad, (state, { pageId, endpoint }): MessagesState => {
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
  on(internalActions.peakMessagesPartLoaded, (state, { pageId, messages }): MessagesState => {
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
  on(internalActions.peakMessagesLoadingDone, (state, { pageId }): MessagesState => {

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
  })
);

export const feature = createFeature({
  name: featureKey,
  reducer: logsReducer
});
