import { SendEndpoint } from '@service-bus-browser/api-contracts';

type AmqpStringPropertyKeys =
  | 'message-id'
  | 'user-id'
  | 'to'
  | 'subject'
  | 'reply-to'
  | 'correlation-id'
  | 'content-type'
  | 'content-encoding'
  | 'group-id'
  | 'reply-to-group-id';

type AmqpDatePropertyKeys = 'absolute-expiry-time' | 'creation-time';

type AmqpNumberPropertyKeys = 'group-sequence';

export type AmqpPropertyKeys =
  | AmqpStringPropertyKeys
  | AmqpDatePropertyKeys
  | AmqpNumberPropertyKeys;

export const AmqpPropertyKeys: AmqpPropertyKeys[] = [
  'message-id',
  'user-id',
  'to',
  'subject',
  'reply-to',
  'correlation-id',
  'content-type',
  'content-encoding',
  'absolute-expiry-time',
  'creation-time',
  'group-id',
  'group-sequence',
  'reply-to-group-id',
];

export type PropertyGroup = {
  key: AmqpPropertyKeys | '';
  value: string | Date | number;
};

export type CustomPropertyType = 'string' | 'number' | 'datetime' | 'boolean';
export type ApplicationPropertyGroup = {
  key: string;
  type: CustomPropertyType | null;
  value: string | number | Date | boolean;
};

export interface SendMessagesForm {
  body: string;
  contentType: string;
  properties: PropertyGroup[];
  applicationProperties: ApplicationPropertyGroup[];
  endpoint: SendEndpoint | null;
}
