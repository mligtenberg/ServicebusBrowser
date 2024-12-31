import { QueueWithMetaData } from './queue';
import { Topic } from './topic';
import { UUID } from '@service-bus-browser/shared-contracts';

export type Namespace = {
  id: UUID;
  name: string;
}

export type NamespaceWithChildren<
  TQueue extends QueueWithMetaData = QueueWithMetaData,
  TTopic extends Topic = Topic
> = Namespace & {
  topics: TTopic[];
  queues: TQueue[];
}
