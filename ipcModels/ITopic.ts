import { IAuthorizationRule } from './IAuthorizationRule';

export interface ITopic {
    name: string,
    properties: {
       defaultMessageTimeToLive: string;
       maxSizeInMegabytes: number;
       requiresDuplicateDetection: boolean;
       duplicateDetectionHistoryTimeWindow: string;
       enableBatchedOperations: boolean;
       authorizationRules?: IAuthorizationRule[];
       userMetadata: string;
       supportOrdering: boolean;
       autoDeleteOnIdle: string;
       enablePartitioning: boolean;
       enableExpress: boolean;
    },
    info: {
        status: string;
        availabilityStatus: string;
        sizeInBytes?: number;
        subscriptionCount?: number;
        scheduledMessageCount: number;
        createdAt: Date;
        modifiedAt: Date;
        accessedAt: Date;
    }
}

export interface ISubscription {
    name: string,
    properties: {
        lockDuration: string;
        requiresSession: boolean;
        defaultMessageTimeToLive: string;
        deadLetteringOnMessageExpiration: boolean;
        deadLetteringOnFilterEvaluationExceptions: boolean;
        maxDeliveryCount: number;
        enableBatchedOperations: boolean;
        forwardTo?: string;
        userMetadata?: string;
        forwardDeadLetteredMessagesTo?: string;
        autoDeleteOnIdle: string;
    },
    info: {
        status: string;
        availabilityStatus?: string;
        topicName: string;
        totalMessageCount: number;
        activeMessageCount: number;
        deadLetterMessageCount: number;
        transferMessageCount: number;
        transferDeadLetterMessageCount: number;
        createdAt: Date;
        modifiedAt: Date;
        accessedAt: Date;
    }
}