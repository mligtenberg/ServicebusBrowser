import { ServiceBusServerFunc } from '../types';
import queuesActions from './queues-actions';
import exchangesActions from './exchanges-actions';

export default new Map<string, ServiceBusServerFunc>([
  ...queuesActions.entries(),
  ...exchangesActions.entries(),
]);
