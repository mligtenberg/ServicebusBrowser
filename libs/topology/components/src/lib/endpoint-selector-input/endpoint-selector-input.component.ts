import { Component, effect, forwardRef, inject, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputGroup } from 'primeng/inputgroup';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Store } from '@ngrx/store';
import { TopologySelectors } from '@service-bus-browser/topology-store';
import { ScrollPanel } from 'primeng/scrollpanel';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import {
  EndpointSelectorTreeInputComponent
} from '../endpoint-selector-tree-input/endpoint-selector-tree-input.component';

@Component({
  selector: 'sbb-tpl-endpoint-selector-input',
  imports: [
    CommonModule,
    InputGroup,
    Dialog,
    InputText,
    Button,
    ScrollPanel,
    InputGroupAddon,
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
  styleUrl: './endpoint-selector-input.component.scss',
})
export class EndpointSelectorInputComponent implements ControlValueAccessor {
  private onChange?: (_: SendEndpoint | null) => void;
  private onTouched?: () => void;

  store = inject(Store);
  disabled = signal(false);
  dialogVisible = signal(false);
  namespaces = this.store.selectSignal(TopologySelectors.selectNamespaces);
  value = model<SendEndpoint | null>(null);

  connectionsFilter = input<string[]>();

  constructor() {
    effect(() => {
      const value = this.value();
      this.onChange?.(value);
      this.onTouched?.();
    });

    effect(() => {
      console.log(this.value());
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
