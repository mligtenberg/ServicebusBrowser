import { createFeature, createReducer, on } from '@ngrx/store';
import { MessagePage } from '@service-bus-browser/messages-contracts';
import { messagePagesActions } from './messages.actions';
import { messagePagesEffectActions } from './messages.effect-actions';
import { UUID } from '@service-bus-browser/shared-contracts';

export const featureKey = 'messages';

export type MessagesState = {
  receivedMessages: Array<MessagePage>;
  messageForBatchResend: Array<string>;
  selectionPerPage: Record<UUID, string[]>;
  runningBatchSendTasks: UUID[];
}

export const initialState: MessagesState = {
  receivedMessages: [],
  messageForBatchResend: [],
  runningBatchSendTasks: [],
  selectionPerPage: {}
};

export const messagesReducer = createReducer(
  initialState,
  on(
    messagePagesEffectActions.pageCreated,
    (state, { pageId, pageName, disabled }): MessagesState => {
      const page = state.receivedMessages.find((page) => page.id === pageId);
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
            loaded: !disabled,
            type: 'messages',
            blocked: disabled,
          },
        ],
      };
    },
  ),
  on(
    messagePagesEffectActions.pageLoaded,
    (state, { pageId }): MessagesState => {
      return {
        ...state,
        receivedMessages: state.receivedMessages.map((page) =>
          page.id === pageId
            ? {
                ...page,
                loaded: true,
                blocked: false,
              }
            : page,
        ),
      };
    },
  ),
  on(
    messagePagesEffectActions.pageLoadCancelled,
    (state, { pageId }): MessagesState => {
      return {
        ...state,
        receivedMessages: state.receivedMessages.map((page) =>
          page.id === pageId
            ? {
                ...page,
                loaded: true,
                blocked: false,
              }
            : page,
        ),
      };
    },
  ),
  on(
    messagePagesEffectActions.pageClosed,
    (state, { pageId }): MessagesState => {
      return {
        ...state,
        receivedMessages: state.receivedMessages.filter(
          (page) => page.id !== pageId,
        ),
      };
    },
  ),
  on(messagePagesActions.setPageFilter, (state, { pageId, filter }): MessagesState => {
    return {
      ...state,
      receivedMessages: state.receivedMessages.map((page) =>
        page.id === pageId ? { ...page, filter } : page,
      ),
    };
  }),
  on(
    messagePagesActions.setPageSelection,
    (state, { pageId, selectionKeys }): MessagesState => {
      return {
        ...state,
        selectionPerPage: {
          ...state.selectionPerPage,
          [pageId]: selectionKeys,
        },
      };
    },
  ),
  on(
    messagePagesActions.renamePage,
    (state, { pageId, pageName }): MessagesState => {
      return {
        ...state,
        receivedMessages: state.receivedMessages.map((page) =>
          page.id === pageId ? { ...page, name: pageName } : page,
        ),
      };
    },
  ),
);

export const feature = createFeature({
  name: featureKey,
  reducer: messagesReducer
});
