import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IMessagesState } from './messages.reducers';
import { IMessageSet, IMessageSetReference, IMessageTableRow } from './messages.models';

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
