import { ServiceBusServerFunc } from '../types';
import receiveMessagesActions from './receive-messages-actions';
import sendMessagesActions from './send-messages-actions';

export default new Map<string, ServiceBusServerFunc>([
  ...receiveMessagesActions.entries(),
  ...sendMessagesActions.entries(),
]);
