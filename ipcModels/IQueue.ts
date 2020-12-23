export interface IQueue {
    name: string;
    queuedMessages: number;
    deadLetterMessages: number;
    scheduledMessages: number;
}