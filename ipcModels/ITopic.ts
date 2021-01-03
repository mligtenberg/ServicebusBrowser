export interface ITopic {
    name: string
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