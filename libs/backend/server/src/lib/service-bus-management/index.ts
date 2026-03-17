import { ServiceBusServerFunc } from '../types';
import queuesActions from './queues-actions';
import topicsActions from './topics-actions';
import subscriptionsActions from './subscriptions-actions';
import subscriptionRuleActions from './subscription-rule-actions';

export default new Map<string, ServiceBusServerFunc>([
  ...queuesActions.entries(),
  ...topicsActions.entries(),
  ...subscriptionsActions.entries(),
  ...subscriptionRuleActions.entries(),
]);
