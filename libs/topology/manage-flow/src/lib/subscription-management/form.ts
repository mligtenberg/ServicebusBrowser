import { FormControl, FormGroup } from '@angular/forms';

export interface SubscriptionForm {
  name: FormControl<string>;
  properties: FormGroup<{
    maxDeliveryCount: FormControl<number>;
    userMetadata: FormControl<string | null>;
    forwardMessagesTo: FormControl<string | null>;
    forwardDeadLetteredMessagesTo: FormControl<string | null>;
    autoDeleteOnIdle: FormControl<string>;
    defaultMessageTimeToLive: FormControl<string>;
    lockDuration: FormControl<string>;
  }>;
  settings: FormGroup<{
    enableBatchedOperations: FormControl<boolean>;
    deadLetteringOnMessageExpiration: FormControl<boolean>;
    deadLetteringOnFilterEvaluationExceptions: FormControl<boolean>;
    requiresSession: FormControl<boolean>;
  }>;
}
