import * as connectionActions from './connections-actions';
import * as queuesActions from './queues-actions';
import * as topicsActions from './topics-actions';
import * as subscriptionsActions from './subscriptions-actions';
import * as rulesActions from './subscription-rule-actions';
import * as receiveMessagesActions from './receive-messages-actions';

export const management = {
  ...connectionActions,
  ...queuesActions,
  ...topicsActions,
  ...subscriptionsActions,
  ...rulesActions,
}

export const messages = {
  ...receiveMessagesActions
}
