import { FormControl, FormGroup } from '@angular/forms';

export interface TopicForm {
  name: FormControl<string>;
  properties: FormGroup<{
    maxSizeInMegabytes: FormControl<number>;
    userMetadata: FormControl<string | null>;
    autoDeleteOnIdle: FormControl<string>;
    duplicateDetectionHistoryTimeWindow: FormControl<string>;
    defaultMessageTimeToLive: FormControl<string>;
  }>;
  settings: FormGroup<{
    enableBatchedOperations: FormControl<boolean>;
    requiresDuplicateDetection: FormControl<boolean>;
    supportOrdering: FormControl<boolean>;
    enablePartitioning: FormControl<boolean>;
    enableExpress: FormControl<boolean>;
  }>;
}
