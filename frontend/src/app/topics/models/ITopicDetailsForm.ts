export interface ITopicDetailsForm {
    name: string;
    defaultMessageTimeToLive: string;
    enableBatchedOperations: boolean;
    userMetadata: string;
    autoDeleteOnIdle: string;
    maxSizeInMegabytes: number;
    requiresDuplicateDetection: boolean;
    duplicateDetectionHistoryTimeWindow: string;
    supportOrdering: boolean;
    enablePartitioning: boolean;
    enableExpress: boolean;
}