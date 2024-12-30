import { Subscription } from './subscription';
import { UUID } from '@service-bus-browser/shared-contracts';

export type Topic = {
  namespaceId: UUID;
  endpoint: string;
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
  },
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
  }
}

export type TopicWithChildren<TSubscription extends Subscription = Subscription> = Topic & {
  subscriptions: TSubscription[];
}
