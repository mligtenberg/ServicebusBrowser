import * as connectionActions from './connections-actions';
import * as queuesActions from './queues-actions';
import * as topicsActions from './topics-actions';
import * as subscriptionsActions from './subscriptions-actions';
import * as rulesActions from './subscription-rule-actions';

export default {
  ...connectionActions,
  ...queuesActions,
  ...topicsActions,
  ...subscriptionsActions,
  ...rulesActions,
}
