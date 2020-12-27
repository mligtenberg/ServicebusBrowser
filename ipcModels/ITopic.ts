export interface ITopic {
    name: string
}

export interface ISubscription {
    name: string,
    queuedMessages: number;
    deadLetterMessages: number;
    transferedDeadletterMessages: number;
}