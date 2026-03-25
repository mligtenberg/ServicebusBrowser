import { FormControl, FormGroup } from '@angular/forms';

export interface ExchangeForm {
  name: FormControl<string>;
  settings: FormGroup<{
    type: FormControl<string>;
    durable: FormControl<boolean>;
    autoDelete: FormControl<boolean>;
    internal: FormControl<boolean>;
  }>;
}
