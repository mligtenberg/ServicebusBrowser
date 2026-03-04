import connectionActions from './connections-actions';
import queuesActions from './queues-actions';
import topicsActions from './topics-actions';
import subscriptionsActions from './subscriptions-actions';
import rulesActions from './subscription-rule-actions';
import receiveMessagesActions from './receive-messages-actions';
import sendMessagesActions from './send-messages-actions';
import { ServiceBusServerFunc } from './types';
import topologyActions from './topology-actions';

export const management = new Map<string, ServiceBusServerFunc>([
  ...connectionActions.entries(),
  ...topologyActions.entries(),
  ...queuesActions.entries(),
  ...topicsActions.entries(),
  ...subscriptionsActions.entries(),
  ...rulesActions.entries(),
]);

export const messages = new Map<string, ServiceBusServerFunc>([
  ...receiveMessagesActions.entries(),
  ...sendMessagesActions.entries(),
]);
