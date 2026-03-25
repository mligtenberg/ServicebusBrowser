import { FormControl, FormGroup } from '@angular/forms';

export interface QueueForm {
  name: FormControl<string>;
  settings: FormGroup<{
    type: FormControl<'classic' | 'quorum' | 'stream'>;
    durable: FormControl<boolean>;
    autoDelete: FormControl<boolean>;
  }>;
}
