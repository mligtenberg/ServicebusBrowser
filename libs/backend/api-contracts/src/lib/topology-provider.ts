import { MessageQueueTargetType } from './message-queue-types';
import { TopologyNode } from './topology/topology-node';

export type TopologyProvider = {
  readonly target: MessageQueueTargetType;
  getTopology: () => Promise<TopologyNode>;
  refreshTopology: (refreshFromPath: string) => Promise<TopologyNode>;
};
