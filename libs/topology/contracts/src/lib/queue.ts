import { UUID } from '@service-bus-browser/shared-contracts';

export type Queue = {
  namespaceId: UUID;
  id: string;
  name: string;
  messageCount: number;
  deadLetterMessageCount: number;
  transferDeadLetterMessageCount: number;
}
