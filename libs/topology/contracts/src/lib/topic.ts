import {
  SubscriptionWithMetaData,
  SubscriptionWithMetaDataAndLoadingState,
} from './subscription';
import { UUID, Problem } from '@service-bus-browser/shared-contracts';

export type Topic = {
  namespaceId: UUID;
  id: string;
  name: string;

  properties: {
    maxSizeInMegabytes: number;
    userMetadata: string | null;
    autoDeleteOnIdle: string;
    defaultMessageTimeToLive: string;
    duplicateDetectionHistoryTimeWindow: string;
  };
  settings: {
    enableBatchedOperations: boolean;
    requiresDuplicateDetection: boolean;
    supportOrdering: boolean;
    enablePartitioning: boolean;
    enableExpress: boolean;
  };
};

export type TopicWithMetaData = Topic & {
  metadata: {
    /**
     * Name of the topic
     */
    name: string;
    /**
     * Specifies the topic size in bytes.
     */
    sizeInBytes?: number;
    /**
     * The subscription count on given topic.
     *
     */
    subscriptionCount?: number;
    /**
     * The number of scheduled messages.
     */
    scheduledMessageCount: number;
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
  };
};

export type TopicWithChildren<
  TSubscription extends SubscriptionWithMetaData = SubscriptionWithMetaData
> = TopicWithMetaData & {
  subscriptions: TSubscription[];
};

export type TopicWithChildrenAndLoadingState =
  TopicWithChildren<SubscriptionWithMetaDataAndLoadingState> & {
    isLoading: boolean;
    hasLoadingError: boolean;
    loadingError?: Problem | null;
  };
