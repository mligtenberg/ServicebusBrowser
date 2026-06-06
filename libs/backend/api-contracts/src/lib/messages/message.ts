export type PropertyValue = number | boolean | string | Date | null;

export type AmqpHeader = {
  durable?: boolean;
  priority?: number;
  ttl?: number;
  'first-acquirer'?: boolean;
  'delivery-count'?: number;
};

export type AmqpHeaderKeys = keyof AmqpHeader;

export type AmqpProperties = {
  'message-id'?: string | number | Uint8Array;
  'user-id'?: Uint8Array;
  to?: string;
  subject?: string;
  'reply-to'?: string;
  'correlation-id'?: string | number | Uint8Array;
  'content-type'?: string;
  'content-encoding'?: string;
  'absolute-expiry-time'?: Date;
  'creation-time'?: Date;
  'group-id'?: string;
  'group-sequence'?: number;
  'reply-to-group-id'?: string;
};

/**
 * Describes the message to be sent to Service Bus.
 */
export interface Message {
  body: Uint8Array;
  messageId?: string | number;
  contentType?: string;

  headers?: AmqpHeader;
  deliveryAnnotations?: Record<string, PropertyValue>;
  messageAnnotations?: Record<string, PropertyValue>;
  properties?: AmqpProperties;
  applicationProperties?: Record<string, PropertyValue>;
}

export interface ReceivedMessage extends Message {
  key: string;
  sequence: string;
}

export type MessagePropertyTypes = Exclude<keyof Message, 'body' | 'messageId' | 'contentType'>;


/**
 * Headers and broker-set annotations belong to the original delivery and must
 * not be carried over when a message is resent. Clearing happens here so the
 * resend path and the batch-resend preview stay in sync about what is dropped.
 */
export function ClearNonResendableProperties<T extends Message>(message: T): T {
  return {
    ...message,
    headers: {},
    deliveryAnnotations: {},
    messageAnnotations: {},
  };
}

export function ToMessageToSend(message: ReceivedMessage): Message {
  return ClearNonResendableProperties({
    body: message.body,
    messageId: message.messageId,
    contentType: message.contentType,
    properties: message.properties,
    applicationProperties: message.applicationProperties,
  });
}
