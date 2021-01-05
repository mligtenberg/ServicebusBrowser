import { IMessage, MessagesChannel } from '../../../../../ipcModels';

export {
    IMessage,
    MessagesChannel
}

export interface IMessageSet {
    connectionId: string;
    origin: MessageOrigin;
    queueName?: string;
    topicName?: string;
    subscriptionName?: string;
    messages: IMessage[];
}

export enum MessageOrigin {
    Queue,
    Subscription
}