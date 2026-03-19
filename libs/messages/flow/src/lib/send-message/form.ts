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

type AmqpHeaderBooleanKeys = 'durable' | 'first-acquirer';

type AmqpHeaderNumberKeys = 'priority' | 'ttl' | 'delivery-count';

export type AmqpHeaderKeys = AmqpHeaderBooleanKeys | AmqpHeaderNumberKeys;

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

export const AmqpHeaderKeys: AmqpHeaderKeys[] = [
  'durable',
  'priority',
  'ttl',
  'first-acquirer',
  'delivery-count',
];

export type PropertyGroup = {
  key: AmqpPropertyKeys | '';
  value: string | Date | number;
};

export type HeaderPropertyGroup = {
  key: AmqpHeaderKeys | '';
  value: boolean | number;
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
  headers: HeaderPropertyGroup[];
  deliveryAnnotations: ApplicationPropertyGroup[];
  messageAnnotations: ApplicationPropertyGroup[];
  applicationProperties: ApplicationPropertyGroup[];
  endpoint: SendEndpoint | null;
}
