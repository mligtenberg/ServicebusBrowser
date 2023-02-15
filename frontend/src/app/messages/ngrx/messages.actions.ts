import { createAction, props } from '@ngrx/store';
import { IMessage, MessagesChannel } from './messages.models';
import Long from 'long';

export const getQueueMessages = createAction(
    '[Messages/Queue] Retreive messages from queue',
    props<{
        connectionId: string;
        queueName: string;
        channel: MessagesChannel;
        numberOfMessages: number;
        skip?: number;
        fromSequenceNumber?: Long;
    }>()
);

export const getQueueMessagesSuccess = createAction(
    '[Messages/Queue/Response] Retreived messages successfully',
    props<{
        messageSetId: string;
        connectionId: string;
        queueName: string;
        channel: MessagesChannel;
        messages: IMessage[];
    }>()
);

export const getQueueMessagesFailure = createAction(
    '[Messages/Queue/Response] Failed to retreive messages',
    props<{
        connectionId: string;
        queueName: string;
        channel: MessagesChannel;
        reason: string;
    }>()
);

export const sendMessages = createAction(
    '[Messages/Send] Sending messages',
    props<{
        operationId: string;
        connectionId: string;
        queueOrTopicName: string;
        messages: IMessage[];
    }>()
);

export const sendMessagesFailure = createAction(
    '[Messages/Send/Response] Could not send messages',
    props<{
        operationId: string;
        connectionId: string;
        queueOrTopicName: string;
        reason: string;
    }>()
);

export const sendMessagesSuccess = createAction(
    '[Messages/Send/Response] Send messages successfully',
    props<{
        operationId: string;
        connectionId: string;
        queueOrTopicName: string;
    }>()
);

export const removeMessageSet = createAction(
    '[Messages/MessageSets] Remove message set',
    props<{
        messageSetId: string;
    }>()
);

export const getSubscriptionMessages = createAction(
    '[Messages/Topic/Subscription] Retreive messages from subscription',
    props<{
        connectionId: string;
        topicName: string;
        subscriptionName: string;
        channel: MessagesChannel;
        numberOfMessages: number;
    }>()
);

export const getSubscriptionMessagesSuccess = createAction(
    '[Messages/Topic/Subscription/Response] Retreived messages successfully',
    props<{
        messageSetId: string;
        connectionId: string;
        topicName: string;
        subscriptionName: string;
        channel: MessagesChannel;
        messages: IMessage[];
    }>()
);

export const getSubscriptionMessagesFailure = createAction(
    '[Messages/Topic/Subscription/Response] Failed to retreive messages',
    props<{
        connectionId: string;
        topicName: string;
        subscriptionName: string;
        channel: MessagesChannel;
        reason: string;
    }>()
);

export const clearQueueMessages = createAction(
    '[Messages/Queue] Delete messages of queue',
    props<{
        connectionId: string;
        queueName: string;
        channel: MessagesChannel;
    }>()
);

export const clearQueueMessagesSucces = createAction(
    '[Messages/Queue/Response] Deleted messages of queue succesfully',
    props<{
        connectionId: string;
        queueName: string;
        channel: MessagesChannel;
    }>()
);

export const clearQueueMessagesFailed = createAction(
    '[Messages/Queue/Response] Deleting messages of queue failed',
    props<{
        connectionId: string;
        queueName: string;
        channel: MessagesChannel;
        reason: string;
    }>()
);

export const clearSubscriptionMessages = createAction(
    '[Messages/Topic/Subscription] Delete messages of subscription',
    props<{
        connectionId: string;
        topicName: string;
        subscriptionName: string;
        channel: MessagesChannel;
    }>()
);

export const clearSubscriptionMessagesSuccesfull = createAction(
    '[Messages/Topic/Subscription] Deleted messages of successfully',
    props<{
        connectionId: string;
        topicName: string;
        subscriptionName: string;
        channel: MessagesChannel;
    }>()
);

export const clearSubscriptionMessagesFailed = createAction(
    '[Messages/Topic/Subscription] Deleting messages of failed',
    props<{
        connectionId: string;
        topicName: string;
        subscriptionName: string;
        channel: MessagesChannel;
        reason: string;
    }>()
);
