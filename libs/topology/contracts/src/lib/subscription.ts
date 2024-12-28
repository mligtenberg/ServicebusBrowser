import { UUID } from '@service-bus-browser/shared-contracts';

export type Subscription = {
  namespaceId: UUID;
  topicId: string;
  id: string;
  name: string;
  messageCount: number;
  deadLetterMessageCount: number;
  transferDeadLetterMessageCount: number;
}
