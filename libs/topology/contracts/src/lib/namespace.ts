import { Queue } from './queue';
import { Topic } from './topic';

export type Namespace = {
  id: string;
  name: string;
}

export type NamespaceWithChildren<
  TQueue extends Queue = Queue,
  TTopic extends Topic = Topic
> = Namespace & {
  topics: TTopic[];
  queues: TQueue[];
}
