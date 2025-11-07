import { UUID } from '@service-bus-browser/shared-contracts';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { ServiceBusMessage } from './messages-contracts';

export interface SendMessagePage {
  id: UUID;
  name: string;
  formState?: {
    body: string;
    contentType: string | null;
    properties: Array<{ key: string; value: string | Date }>;
    customProperties: Array<{ key: string; type: string; value: string | number | Date | boolean }>;
    endpoint: SendEndpoint | null;
  };
  sourceMessageId?: string; // If resending a specific message
  sourcePageId?: string; // If resending from a specific page
}
