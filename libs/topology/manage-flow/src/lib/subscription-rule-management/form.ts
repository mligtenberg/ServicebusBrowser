import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { systemPropertyKeys } from '@service-bus-browser/topology-contracts';

export interface SubscriptionRuleForm {
  name: FormControl<string>;
  type: FormControl<'sql' | 'correlation'>;
  sqlFilter: FormControl<string | null>;
  sqlAction: FormControl<string | null>;
  correlationSystemProperties: FormArray<FormGroup<{
    key: FormControl<systemPropertyKeys>;
    value: FormControl<string>;
  }>>,
  correlationApplicationProperties: FormArray<FormGroup<{
    key: FormControl<string>;
    value: FormControl<string | number | Date | boolean>;
  }>>;
}
