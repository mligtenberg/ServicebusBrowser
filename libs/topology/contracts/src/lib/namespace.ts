import { QueueWithMetaData } from './queue';
import { TopicWithChildrenAndLoadingState, TopicWithMetaData } from './topic';
import { UUID, Problem } from '@service-bus-browser/shared-contracts';

export type Namespace = {
  id: UUID;
  name: string;
};

export type NamespaceWithChildren<
  TQueue extends QueueWithMetaData = QueueWithMetaData,
  TTopic extends TopicWithMetaData = TopicWithMetaData
> = Namespace & {
  topics: TTopic[];
  queues: TQueue[];
};

export type NamespaceWithChildrenAndLoadingState = NamespaceWithChildren<
  QueueWithMetaData,
  TopicWithChildrenAndLoadingState
> & {
  isLoadingQueues: boolean;
  isLoadingTopics: boolean;
  hasQueuesLoadingError: boolean;
  queueLoadingError?: Problem | null;
  hasTopicsLoadingError: boolean;
  topicLoadingError?: Problem | null;
};
