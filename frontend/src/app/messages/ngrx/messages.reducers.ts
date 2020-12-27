import { createReducer, on } from "@ngrx/store";
import { IMessageSet, MessageOrigin } from "./messages.models";
import * as actions from "./messages.actions";

export interface IMessagesState {
    openedMessages: IMessageSet
}

const initialState: IMessagesState = {
    openedMessages: null
}

export const messagesReducer = createReducer<IMessagesState>(
    initialState,
    on(actions.getQueueMessagesSuccess, (state, action) => {
        return {
            ...state,
            openedMessages: {
                connectionId: action.connectionId,
                origin: MessageOrigin.Queue,
                queueName: action.queueName,
                messages: action.messages
            }
        }
    }),
    on(actions.getSubscriptionMessagesSuccess, (state, action) => {
        return {
            ...state,
            openedMessages: {
                connectionId: action.connectionId,
                origin: MessageOrigin.Subscription,
                topicName: action.topicName,
                subscriptionName: action.subscriptionName,
                messages: action.messages
            }
        }
    }),
    on(actions.getQueueMessages, actions.getSubscriptionMessages, (state) => {
        return {
            ...state,
            openedMessages: null
        }
    })
)