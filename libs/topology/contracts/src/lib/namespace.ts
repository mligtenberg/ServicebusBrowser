import { QueueWithMetaData } from './queue';
import { TopicWithMetaData } from './topic';
import { UUID } from '@service-bus-browser/shared-contracts';

export type Namespace = {
  id: UUID;
  name: string;
}

export type NamespaceWithChildren<
  TQueue extends QueueWithMetaData = QueueWithMetaData,
  TTopic extends TopicWithMetaData = TopicWithMetaData
> = Namespace & {
  topics: TTopic[];
  queues: TQueue[];
}
