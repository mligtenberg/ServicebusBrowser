export interface IQueueDetailsForm {
    name: string;
    lockDuration: string;
    maxSizeInMegabytes: number;
    requiresDuplicateDetection: boolean;
    requiresSession: boolean;
    defaultMessageTimeToLive: string;
    deadLetteringOnMessageExpiration: boolean;
    duplicateDetectionHistoryTimeWindow: string;
    maxDeliveryCount: number;
    enableBatchedOperations: boolean;
    forwardTo: string;
    userMetadata: string;
    autoDeleteOnIdle: boolean;
    enablePartitioning: boolean;
    forwardDeadLetteredMessagesTo: string;
    enableExpress: boolean;
}