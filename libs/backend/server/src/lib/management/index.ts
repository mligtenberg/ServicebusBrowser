import { ServiceBusServerFunc } from '../types';
import connectionActions from './connections-actions';
import topologyActions from './topology-actions';

export default new Map<string, ServiceBusServerFunc>([
  ...connectionActions.entries(),
  ...topologyActions.entries(),
]);
