import { FormArray, FormControl, FormGroup } from '@angular/forms';
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

export type SystemPropertyGroup = { key: FormControl<SystemPropertyKeys | null>; value: FormControl<string | Date>};

export type CustomPropertyGroup = { key: FormControl<string>; value: FormControl<string | number | Date> };

export interface SendMessagesForm {
  body: FormControl<string>;
  contentType: FormControl<string | null>;
  properties: FormArray<FormGroup<SystemPropertyGroup>>;
  customProperties: FormArray<FormGroup<CustomPropertyGroup>>;
  endpoint: FormControl<SendEndpoint | null>;
}
