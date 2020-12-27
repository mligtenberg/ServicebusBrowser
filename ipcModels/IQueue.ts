export interface IQueue {
    name: string;
    queuedMessages: number;
    deadLetterMessages: number;
    transferedDeadletterMessages: number;
}