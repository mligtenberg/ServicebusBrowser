import { IMessage } from '../../../../../ipcModels';

export {
    IMessage
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