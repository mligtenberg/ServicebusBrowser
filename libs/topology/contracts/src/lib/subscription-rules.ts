export type SubscriptionRule = {
  filterType: 'sql',
    filter: string;
  action: string;
} | {
  filterType: 'correlation',
    contentType?: string;
  correlationId?: string;
  subject?: string;
  messageId?: string;
  replyTo?: string;
  replyToSessionId?: string;
  sessionId?: string;
  to?: string;
  applicationProperties?: Array<{key: string, value: string}>;
}
