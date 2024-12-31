import { FormControl, FormGroup } from '@angular/forms';

export interface QueueForm {
  name: FormControl<string>;
  properties: FormGroup<{
    maxSizeInMegabytes: FormControl<number>;
    maxDeliveryCount: FormControl<number>;
    userMetadata: FormControl<string | null>;
    forwardMessagesTo: FormControl<string | null>;
    forwardDeadLetteredMessagesTo: FormControl<string | null>;
    duplicateDetectionHistoryTimeWindow: FormControl<string | null>;
    autoDeleteOnIdle: FormControl<string | null>;
    defaultMessageTimeToLive: FormControl<string | null>;
    lockDuration: FormControl<string | null>;
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
