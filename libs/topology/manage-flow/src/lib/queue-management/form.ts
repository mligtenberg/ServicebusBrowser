import { FormControl, FormGroup } from '@angular/forms';

export interface QueueForm {
  name: FormControl<string>;
  properties: FormGroup<{
    maxSizeInMegabytes: FormControl<number>;
    maxDeliveryCount: FormControl<number>;
    userMetadata: FormControl<string | null>;
    forwardMessagesTo: FormControl<string | null>;
    forwardDeadLetteredMessagesTo: FormControl<string | null>;
    duplicateDetectionHistoryTimeWindow: FormControl<string>;
    autoDeleteOnIdle: FormControl<string>;
    defaultMessageTimeToLive: FormControl<string>;
    lockDuration: FormControl<string>;
  }>;
  settings: FormGroup<{
    enableBatchedOperations: FormControl<boolean>;
    deadLetteringOnMessageExpiration: FormControl<boolean>;
    enablePartitioning: FormControl<boolean>;
    enableExpress: FormControl<boolean>;
    requiresDuplicateDetection: FormControl<boolean>;
    requiresSession: FormControl<boolean>;
  }>;
}