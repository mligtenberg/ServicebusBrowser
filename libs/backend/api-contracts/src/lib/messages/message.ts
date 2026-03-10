export type PropertyValue = number | boolean | string | Date | null;

/**
 * Describes the message to be sent to Service Bus.
 */
export interface Message {
  body: Uint8Array;
  messageId?: string | number;
  contentType?: string;

  systemProperties?: Record<string, PropertyValue>;
  applicationProperties?: Record<string, PropertyValue>;
}

export interface ReceivedMessage extends Message {
  key: string;
  sequence: string;
}

export function ToMessageToSend(message: ReceivedMessage): Message {
  return {
    body: message.body,
    messageId: message.messageId,
    contentType: message.contentType,
    systemProperties: message.systemProperties,
    applicationProperties: message.applicationProperties,
  };
}
