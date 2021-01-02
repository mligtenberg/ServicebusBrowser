export interface IQueue {
    name: string;
    properties: {
        lockDuration: string;
        maxSizeInMegabytes: number;
        requiresDuplicateDetection: boolean;
        requiresSession: boolean;
        defaultMessageTimeToLive: string;
        deadLetteringOnMessageExpiration: boolean;
        duplicateDetectionHistoryTimeWindow: string;
        maxDeliveryCount: number;
        enableBatchedOperations: boolean;
        forwardTo?: string;
        userMetadata: string;
        autoDeleteOnIdle: string;
        enablePartitioning: boolean;
        forwardDeadLetteredMessagesTo?: string;
        enableExpress: boolean;
    },
    info: {
        status: string;
        createdAt: Date;
        modifiedAt: Date;
        accessedAt: Date;
        totalMessageCount?: number;
        activeMessageCount: number;
        deadLetterMessageCount: number;
        scheduledMessageCount: number;
        transferMessageCount: number;
        transferDeadLetterMessageCount: number;
        sizeInBytes?: number;
        availabilityStatus: string;
    },
    authorizationRules?: IAuthorizationRule[];
}

export declare interface IAuthorizationRule {
    claimType: string;
    accessRights?: ("Manage" | "Send" | "Listen")[];
    keyName: string;
    primaryKey?: string;
    secondaryKey?: string;
}