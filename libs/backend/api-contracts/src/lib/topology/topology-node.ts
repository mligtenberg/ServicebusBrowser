import { ReceiveEndpoint } from '../endpoints/receive-endpoint';
import { SendEndpoint } from '../endpoints/send-endpoint';
import { TopologyAction } from './topology-action';
import { IconDefinition } from '@fortawesome/angular-fontawesome';

export type TopologyNode = {
  type: 'connection' | 'operational-grouping' | string;
  selectable: boolean;
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
