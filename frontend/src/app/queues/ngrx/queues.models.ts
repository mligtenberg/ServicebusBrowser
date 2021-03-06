import { IAuthorizationRule } from "../../models/IAuthorizationRule";

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
        autoDeleteOnIdle: boolean;
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
export interface IQueueConnectionSet {
    connectionId: string,
    queues: IQueue[]
}