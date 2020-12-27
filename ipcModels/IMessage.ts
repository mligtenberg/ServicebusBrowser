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
    scheduled
}