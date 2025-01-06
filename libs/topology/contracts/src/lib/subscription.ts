import { UUID } from '@service-bus-browser/shared-contracts';
import { SubscriptionRule } from './subscription-rules';
import { TopicWithChildren } from './topic';

export type Subscription = {
  namespaceId: UUID;
  topicId: string;
  id: string;
  name: string;
  properties: {
    userMetadata: string | null;
    forwardMessagesTo: string | null;
    maxDeliveryCount: number;
    forwardDeadLetteredMessagesTo: string | null;
    autoDeleteOnIdle: string;
    defaultMessageTimeToLive: string;
    lockDuration: string;
  };
  settings: {
    enableBatchedOperations: boolean;
    deadLetteringOnMessageExpiration: boolean;
    deadLetteringOnFilterEvaluationExceptions: boolean;
    requiresSession: boolean;
  },
}


export type SubscriptionWithMetaData = Subscription & {
  metaData: {
    /**
     * Name of the subscription
     */
    subscriptionName: string;
    /**
     * Name of the topic
     */
    topicName: string;
    /**
     * The entity's message count.
     *
     */
    totalMessageCount: number;
    /**
     * The number of active messages in the queue.
     */
    activeMessageCount: number;
    /**
     * The number of messages that have been dead lettered.
     */
    deadLetterMessageCount: number;
    /**
     * The number of messages transferred to another queue, topic, or subscription
     */
    transferMessageCount: number;
    /**
     * The number of messages transferred to the dead letter queue.
     */
    transferDeadLetterMessageCount: number;
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
     * The endpoint URL for the entity.
     */
    endpoint: string;
  },
  rules: SubscriptionRule[];
}

export type SubscriptionWithMetaDataAndLoadingState = SubscriptionWithMetaData & { isLoading: boolean };
