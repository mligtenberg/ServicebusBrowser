import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';

type SystemStringPropertyKeys = 'correlationId'
  | 'partitionKey'
  | 'sessionId'
  | 'replyToSessionId'
  | 'messageId'
  | 'subject'
  | 'to'
  | 'replyTo';

type SystemDatePropertyKeys = 'scheduledEnqueueTimeUtc';

type SystemTimeSpanPropertyKeys = 'timeToLive';

export type SystemPropertyKeys = SystemStringPropertyKeys
  | SystemDatePropertyKeys
  | SystemTimeSpanPropertyKeys;

export const SystemPropertyKeys: SystemPropertyKeys[] = [
  'correlationId',
  'partitionKey',
  'sessionId',
  'replyToSessionId',
  'messageId',
  'subject',
  'to',
  'replyTo',
  'scheduledEnqueueTimeUtc',
  'timeToLive'
]


export type SystemPropertyGroup = {
  key: SystemPropertyKeys | '';
  value: string | Date
};

export type CustomPropertyType = 'string' | 'number' | 'datetime' | 'boolean';
export type ApplicationPropertyGroup = {
  key: string;
  type: CustomPropertyType | null;
  value: string | number | Date | boolean
};

export interface SendMessagesForm {
  body: string;
  contentType: string;
  systemProperties: SystemPropertyGroup[];
  applicationProperties: ApplicationPropertyGroup[];
  endpoint: SendEndpoint | null;
}
