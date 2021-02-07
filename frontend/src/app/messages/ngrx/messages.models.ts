export interface IMessage {
    id: string;
    properties: {
        subject: string;
        contentType: string;
        correlationId: string;
        messageId: string;
        sequenceNumber: Long;
        enqueueTime: Date;
        enqueueSequenceNumber: number;
    },
    customProperties: Map<string, string | boolean | number | Date>;
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