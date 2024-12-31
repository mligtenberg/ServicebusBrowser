import { Component, effect, forwardRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputGroup } from 'primeng/inputgroup';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Store } from '@ngrx/store';
import { TopologySelectors } from '@service-bus-browser/topology-store';
import { TopologyTreeComponent } from '../topology-tree/topology-tree.component';
import { ScrollPanel } from 'primeng/scrollpanel';
import { QueueWithMetaData, TopicWithMetaData } from '@service-bus-browser/topology-contracts';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'sbb-tpl-endpoint-selector-input',
  imports: [
    CommonModule,
    InputGroup,
    Dialog,
    InputText,
    Button,
    TopologyTreeComponent,
    ScrollPanel,
    InputGroupAddon,
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
  private onChange?: (_: string | null) => void;
  private onTouched?: () => void;

  store = inject(Store);
  disabled = signal(false);
  dialogVisible = signal(false);
  namespaces = this.store.selectSignal(TopologySelectors.selectNamespaces);
  value = signal<string | null>(null);

  constructor() {
    effect(() => {
      const value = this.value();
      this.onChange?.(value);
      this.onTouched?.();
    });
  }

  onQueueSelected($event: { namespaceId: string; queue: QueueWithMetaData }) {
    this.value.set($event.queue.metadata.endpoint);
    this.dialogVisible.set(false);
  }

  onTopicSelected($event: { namespaceId: string; topic: TopicWithMetaData }) {
    this.value.set($event.topic.metadata.endpoint);
    this.dialogVisible.set(false);
  }

  writeValue(obj: string | null): void {
    this.value.set(obj);
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
}
