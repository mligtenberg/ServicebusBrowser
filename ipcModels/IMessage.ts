export interface IMessage {
    subject: string;
    properties: Map<string, string>;
    customProperties: Map<string, string>;
    body: string;
}