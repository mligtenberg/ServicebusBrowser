import { UUID } from '@service-bus-browser/shared-contracts';

export type systemPropertyKeys = 'contentType' | 'correlationId' | 'subject' | 'messageId' | 'replyTo' | 'replyToSessionId' | 'sessionId' | 'to' | 'applicationProperties';

type SubscriptionRuleBase = {
  name: string;
  namespaceId: UUID;
  topicId: string;
  subscriptionId: string;
}

export type SubscriptionRule = SubscriptionRuleBase & ({
  filterType: 'sql',
  filter: string;
  action: string;
} | {
  filterType: 'correlation',
  systemProperties?: Array<{key: systemPropertyKeys, value: string}>;
  applicationProperties?: Array<{key: string, value: string | number | boolean | Date}>;
})
