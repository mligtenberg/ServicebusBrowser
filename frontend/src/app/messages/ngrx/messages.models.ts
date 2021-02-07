export interface IMessage {
    id: string;
    subject: string;
    properties: Map<string, string>;
    customProperties: Map<string, string>;
    body: string;
}

export enum MessagesChannel {
    regular,
    deadletter,
    transferedDeadletters
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