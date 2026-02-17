import { createFeature, createReducer, on } from '@ngrx/store';
import { MessagePage } from '@service-bus-browser/messages-contracts';
import * as actions from './messages.actions';
import * as internalActions from './messages.internal-actions';
import { UUID } from '@service-bus-browser/shared-contracts';

export const featureKey = 'messages';

export type MessagesState = {
  receivedMessages: Array<MessagePage>;
  messageForBatchResend: Array<string>;
  runningBatchSendTasks: UUID[];
}

export const initialState: MessagesState = {
  receivedMessages: [],
  messageForBatchResend: [],
  runningBatchSendTasks: []
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
          name: pageName,
          retrievedAt: new Date(),
          loaded: true
        }
      ]
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
  }),
  on(internalActions.updatePageName, (state, { pageId, pageName }): MessagesState => {
    return {
      ...state,
      receivedMessages: state.receivedMessages.map(page => page.id === pageId ? { ...page, name: pageName } : page)
    }
  }),
  on(actions.sendPartialBatch, (state, { transactionId }): MessagesState => {
    return {
      ...state,
      runningBatchSendTasks: [...state.runningBatchSendTasks, transactionId]
    }
  }),
  on(internalActions.batchSendCompleted, (state, { transactionId }): MessagesState => {
    return {
      ...state,
      runningBatchSendTasks: state.runningBatchSendTasks.filter(taskId => taskId !== transactionId)
    }
  })
);

export const feature = createFeature({
  name: featureKey,
  reducer: logsReducer
});
