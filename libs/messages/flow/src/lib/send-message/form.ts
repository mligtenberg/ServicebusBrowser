import { FormArray, FormControl, FormGroup } from '@angular/forms';

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

export type SystemPropertyGroup = { key: FormControl<SystemStringPropertyKeys>; value: FormControl<string>}
| { key: FormControl<SystemDatePropertyKeys>; value: FormControl<Date> }
| { key: FormControl<SystemTimeSpanPropertyKeys>; value: FormControl<string> }

export type CustomPropertyGroup = { key: FormControl<string>; value: FormControl<string | number | Date> };

export interface SendMessagesForm {
  body: FormControl<string>;
  contentType: FormControl<string | null>;
  properties: FormArray<FormGroup<SystemPropertyGroup>>;
  customProperties: FormArray<FormGroup<CustomPropertyGroup>>;
}
