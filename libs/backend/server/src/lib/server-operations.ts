import connectionActions from './connections-actions';
import { ServiceBusServerFunc } from './types';
import topologyActions from './topology-actions';

export const managementOperations = new Map<string, ServiceBusServerFunc>([
  ...connectionActions.entries(),
  ...topologyActions.entries(),
]);
