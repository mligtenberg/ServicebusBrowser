import {
  Component,
  effect,
  forwardRef,
  inject,
  input,
  model,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';

import { Store } from '@ngrx/store';
import { TopologySelectors } from '@service-bus-browser/topology-store';
import {
  SbbButton,
  SbbDialog,
  SbbInput,
  SbbInputGroup,
  SbbInputGroupAddon,
  SbbScrollPanel,
} from '@service-bus-browser/shared-ui';
import { faSearch, faXmark } from '@fortawesome/free-solid-svg-icons';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { SendEndpoint } from '@service-bus-browser/api-contracts';
import { EndpointSelectorTreeInputComponent } from '../endpoint-selector-tree-input/endpoint-selector-tree-input.component';

@Component({
  selector: 'sbb-tpl-endpoint-selector-input',
  imports: [
    SbbInputGroup,
    SbbInputGroupAddon,
    SbbInput,
    SbbButton,
    SbbDialog,
    SbbScrollPanel,
    EndpointSelectorTreeInputComponent,
    FormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EndpointSelectorInputComponent),
      multi: true,
    },
  ],
  templateUrl: './endpoint-selector-input.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './endpoint-selector-input.component.scss',
})
export class EndpointSelectorInputComponent implements ControlValueAccessor {
  private onChange?: (_: SendEndpoint | null) => void;
  private onTouched?: () => void;

  store = inject(Store);
  disabled = signal(false);
  dialogVisible = signal(false);
  value = model<SendEndpoint | null>(null);

  connectionsFilter = input<string[]>();

  protected readonly clearIcon = faXmark;
  protected readonly searchIcon = faSearch;

  constructor() {
    effect(() => {
      const value = this.value();
      this.onChange?.(value);
      this.onTouched?.();
    });
  }

  writeValue(obj: SendEndpoint | null): void {
    this.value.set(obj);
  }

  registerOnChange(fn: (_: SendEndpoint | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
