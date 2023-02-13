import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IMessagesState } from './messages.reducers';
import { IMessageSetReference } from './messages.models';

const getMessagesFeatureState = createFeatureSelector<IMessagesState>('messages');

export const getMessages = (messageSetId: string) =>
    createSelector(getMessagesFeatureState, (state) => state.messageSets.find((ms) => ms.messageSetId === messageSetId));

export const getMessageSetReferences = createSelector(getMessagesFeatureState, (state) =>
    state.messageSets.map((ms) => {
        return {
            messageSetId: ms.messageSetId,
            name: ms.name,
        } as IMessageSetReference;
    })
);

export const getMessage = (messageSetId: string, messageId: string) => {
    return createSelector(getMessages(messageSetId), (messageSet) => {
        return messageSet?.messages.find((m) => m.id === messageId);
    });
};
