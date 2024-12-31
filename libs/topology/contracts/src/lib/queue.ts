import { UUID } from '@service-bus-browser/shared-contracts';

export type Queue = {
  namespaceId: UUID;
  id: string;
  name: string;
  properties: {
    lockDuration: string;
    maxSizeInMegabytes: number;
    defaultMessageTimeToLive: string;
    duplicateDetectionHistoryTimeWindow: string;
    maxDeliveryCount: number;
    userMetadata: string | null;
    autoDeleteOnIdle: string;
    forwardMessagesTo: string | null;
    forwardDeadLetteredMessagesTo: string | null;
  };
  settings: {
    requiresDuplicateDetection: boolean;
    requiresSession: boolean;
    deadLetteringOnMessageExpiration: boolean;
    enableBatchedOperations: boolean;
    enableExpress: boolean;
    enablePartitioning: boolean;
  },
}

export type QueueWithMetaData = Queue & {
  metadata: {
    /**
     * Created at timestamp
     */
    createdAt: Date;
    /**
     * Updated at timestamp
     */
    modifiedAt: Date;
    /**
     * Accessed at timestamp
     */
    accessedAt: Date;
    /**
     * The entity's message count.
     *
     */
    totalMessageCount?: number;
    /**
     * The number of active messages in the queue.
     */
    activeMessageCount: number;
    /**
     * The number of messages that have been dead lettered.
     */
    deadLetterMessageCount: number;
    /**
     * The number of scheduled messages.
     */
    scheduledMessageCount: number;
    /**
     * The number of messages transferred to another queue, topic, or subscription
     */
    transferMessageCount: number;
    /**
     * The number of messages transferred to the dead letter queue.
     */
    transferDeadLetterMessageCount: number;
    /**
     * The entity's size in bytes.
     *
     */
    sizeInBytes?: number;
    /**
     * The endpoint URL for the entity.
     */
    endpoint: string;
  }
}
