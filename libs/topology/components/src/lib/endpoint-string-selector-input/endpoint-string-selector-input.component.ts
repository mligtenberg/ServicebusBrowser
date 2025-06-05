import { Component, forwardRef, input, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EndpointSelectorInputComponent } from '../endpoint-selector-input/endpoint-selector-input.component';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';

@Component({
  selector: 'sbb-tpl-endpoint-string-selector-input',
  imports: [CommonModule, EndpointSelectorInputComponent, FormsModule],
  templateUrl: './endpoint-string-selector-input.component.html',
  styleUrl: './endpoint-string-selector-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EndpointStringSelectorInputComponent),
      multi: true,
    },
  ],
})
export class EndpointStringSelectorInputComponent
  implements ControlValueAccessor
{
  private onChange?: (_: string | null) => void;
  private onTouched?: () => void;

  endpoint = model<SendEndpoint | null>(null);
  disabled = model<boolean>(false);
  connectionsFilter = input<string[]>();

  writeValue(obj: string): void {
    this.endpoint.set({
      endpoint: obj,
      queueName: '',
      connectionId: '0-0-0-0-0',
      endpointDisplay: obj
    });
  }
  registerOnChange(fn: (_: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  propagateChanges() {
    this.onTouched?.();
    this.onChange?.(this.endpoint()?.endpoint ?? null);
  }
}
