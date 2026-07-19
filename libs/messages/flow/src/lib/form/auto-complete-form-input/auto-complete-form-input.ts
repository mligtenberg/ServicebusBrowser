import { Component, input, model, output, ChangeDetectionStrategy } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { SbbAutocomplete } from '@service-bus-browser/shared-ui';

/**
 * Mirrors the `.query` field of the previous autocomplete's
 * complete event (the only field every call site of `completeMethod` reads).
 * Defined locally so this component no longer depends on that library — the
 * replacement `SbbAutocomplete.completeChange` output only exposes the raw
 * query string (no native DOM event), so `originalEvent` has no equivalent
 * and has been dropped.
 */
export interface AutoCompleteCompleteEvent {
  query: string;
}

@Component({
  selector: 'lib-auto-complete-form-input',
  imports: [FormsModule, SbbAutocomplete],
  templateUrl: './auto-complete-form-input.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './auto-complete-form-input.scss',
})
export class AutoCompleteFormInput<T>
  implements FormValueControl<T | undefined>
{
  value = model<T>();
  disabled = input<boolean>(false);
  readonly = input<boolean>(false);
  hidden = input<boolean>(false);
  required = input<boolean>(false);

  suggestions = input<T[]>();
  completeMethod = output<AutoCompleteCompleteEvent>();
  hide = output<void>();
}
