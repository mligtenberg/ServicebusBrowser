export type systemPropertyKeys = 'contentType' | 'correlationId' | 'subject' | 'messageId' | 'replyTo' | 'replyToSessionId' | 'sessionId' | 'to' | 'applicationProperties';

export type SubscriptionRule = {
  filterType: 'sql',
    filter: string;
  action: string;
} | {
  filterType: 'correlation',
  systemProperties?: Array<{key: systemPropertyKeys, value: string}>;
  applicationProperties?: Array<{key: string, value: string | number | boolean | Date}>;
}
