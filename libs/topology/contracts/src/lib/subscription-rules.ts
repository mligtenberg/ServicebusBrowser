import { UUID } from '@service-bus-browser/shared-contracts';

export type systemPropertyKeys = 'contentType' | 'correlationId' | 'subject' | 'messageId' | 'replyTo' | 'replyToSessionId' | 'sessionId' | 'to' | 'applicationProperties';

type SubscriptionRuleBase = {
  name: string;
  namespaceId: UUID;
  topicId: string;
  subscriptionId: string;
  action: string;
}

type SqlSubscriptionRule = SubscriptionRuleBase & {
  filterType: 'sql',
  filter: string;
}
type CorrelationSubscriptionRule = SubscriptionRuleBase & {
  filterType: 'correlation',
  systemProperties?: Array<{key: systemPropertyKeys, value: string}>;
  applicationProperties?: Array<{key: string, value: string | number | boolean | Date}>;
}

export type SubscriptionRule = SqlSubscriptionRule | CorrelationSubscriptionRule;
