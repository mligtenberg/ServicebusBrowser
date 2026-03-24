import { UUID } from '@service-bus-browser/shared-contracts';
import { MessageQueueTargetType } from '../message-queue-types';

export interface ConnectionBase {
  id: UUID;
  type: string;
  name: string;
  target: MessageQueueTargetType;
}
