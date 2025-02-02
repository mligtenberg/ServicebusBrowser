import { Component, effect, forwardRef, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { SendEndpoint } from '@service-bus-browser/service-bus-contracts';
import { TopologySelectors } from '@service-bus-browser/topology-store';
import { QueueWithMetaData, TopicWithMetaData } from '@service-bus-browser/topology-contracts';
import { TopologyTreeComponent } from '../topology-tree/topology-tree.component';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'sbb-tpl-endpoint-selector-tree-input',
  imports: [CommonModule, TopologyTreeComponent],
  templateUrl: './endpoint-selector-tree-input.component.html',
  styleUrl: './endpoint-selector-tree-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EndpointSelectorTreeInputComponent),
      multi: true,
    },
  ],
})
export class EndpointSelectorTreeInputComponent implements ControlValueAccessor {
  private onChange?: (_: SendEndpoint | null) => void;
  private onTouched?: () => void;

  store = inject(Store);
  disabled = signal(false);
  namespaces = this.store.selectSignal(TopologySelectors.selectNamespaces);
  value = signal<SendEndpoint | null>(null);
  selected = output<SendEndpoint>();

  connectionsFilter = input<string[]>();

  constructor() {
    effect(() => {
      const value = this.value();
      this.onChange?.(value);
      this.onTouched?.();

      if (value) {
        this.selected.emit(value);
      }
    });
  }

  onQueueSelected($event: { namespaceId: string; queue: QueueWithMetaData }) {
    this.value.set({
      endpoint: $event.queue.metadata.endpoint,
      queueName: $event.queue.name,
      connectionId: $event.queue.namespaceId,
    });
  }

  onTopicSelected($event: { namespaceId: string; topic: TopicWithMetaData }) {
    this.value.set({
      endpoint: $event.topic.metadata.endpoint,
      topicName: $event.topic.name,
      connectionId: $event.topic.namespaceId,
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
