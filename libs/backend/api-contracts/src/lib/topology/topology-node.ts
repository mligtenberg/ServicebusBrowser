import { ReceiveEndpoint } from '../endpoints/receive-endpoint';
import { SendEndpoint } from '../endpoints/send-endpoint';
import { TopologyAction } from './topology-action';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { CustomIconDefinition } from '@service-bus-browser/custom-icons';

export type TopologyNode = {
  type: 'connection' | 'operational-grouping' | string;
  selectable: boolean;
  path: string;
  icon?: IconDefinition | CustomIconDefinition;
  name: string;
  refreshable: boolean;
  defaultAction?: TopologyAction;
  availableMessageCounts?: {
    name: string;
    count: number;
    showInSummary: boolean;
  }[];
  sendEndpoint?: SendEndpoint;
  receiveEndpoints?: ReceiveEndpoint[];
  children?: TopologyNode[];
  actions?: TopologyAction[];
  errored?: boolean;
  errorMessage?: string;
};
