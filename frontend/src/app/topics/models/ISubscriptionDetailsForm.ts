export interface ISubscriptionDetailsForm {
    name: string;
    lockDuration: string;
    requiresSession: boolean;
    defaultMessageTimeToLive: string;
    deadLetteringOnMessageExpiration: boolean;
    maxDeliveryCount: number;
    enableBatchedOperations: boolean;
    forwardTo: string;
    userMetadata: string;
    autoDeleteOnIdle: string;
    forwardDeadLetteredMessagesTo: string;
    deadLetteringOnFilterEvaluationExceptions: boolean;
}