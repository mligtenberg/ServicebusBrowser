import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IMessagesState } from "./messages.reducers";

const getMessagesFeatureState = createFeatureSelector<IMessagesState>('messages');

export const getMessages = (connectionId: string) => createSelector(
    getMessagesFeatureState,
    (state) => state.openedMessages
)
