import { UUID } from '@service-bus-browser/shared-contracts';

export type Subscription = {
  namespaceId: UUID;
  topicId: string;
  id: string;
  endpoint: string;
  name: string;
  messageCount: number;
  deadLetterMessageCount: number;
  transferDeadLetterMessageCount: number;
}
