import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IMessagesState } from "./messages.reducers";

const getMessagesFeatureState = createFeatureSelector<IMessagesState>('messages');

export const getMessages = createSelector(
    getMessagesFeatureState,
    (state) => state.openedMessages
)
