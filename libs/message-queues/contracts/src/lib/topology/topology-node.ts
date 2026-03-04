import { ReceiveEndpoint } from '../receive-endpoint';
import { SendEndpoint } from '../send-endpoint';
import { TopologyAction } from './topology-action';
import { IconDefinition } from '@fortawesome/angular-fontawesome';

export type TopologyNode = {
  path: string;
  icon?: IconDefinition;
  name: string;
  refreshable: boolean;
  defaultAction?: TopologyAction;
  availableMessageCounts?: Record<string, number>;
  sendEndpoint?: SendEndpoint;
  receiveEndpoints?: ReceiveEndpoint[];
  children?: TopologyNode[];
  actions?: TopologyAction[];
};
