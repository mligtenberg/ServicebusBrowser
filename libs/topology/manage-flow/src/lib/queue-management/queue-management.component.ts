import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QueueForm } from './form';
import { Store } from '@ngrx/store';
import {
  TopologyActions,
  TopologySelectors,
} from '@service-bus-browser/topology-store';
import { combineLatest, map, of, Subject, switchMap } from 'rxjs';
import { UUID } from '@service-bus-browser/shared-contracts';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { EndpointSelectorInputComponent } from '@service-bus-browser/topology-components';
import { Checkbox } from 'primeng/checkbox';
import { ButtonDirective } from 'primeng/button';
import { Queue, QueueWithMetaData } from '@service-bus-browser/topology-contracts';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'lib-queue-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DurationInputComponent,
    Card,
    InputText,
    FloatLabel,
    InputNumber,
    Textarea,
    EndpointSelectorInputComponent,
    Checkbox,
    ButtonDirective,
    TableModule,
  ],
  templateUrl: './queue-management.component.html',
  styleUrl: './queue-management.component.scss',
})
export class QueueManagementComponent {
  activeRoute = inject(ActivatedRoute);
  store = inject(Store);
  form = this.createForm();
  action = signal<'create' | 'modify'>('create');
  currentQueue = signal<QueueWithMetaData | undefined>(undefined);
  currentQueueInformation = computed(() => {
    const queue = this.currentQueue();
    if (!queue) {
      return [];
    }

    return Object.entries(queue.metadata).map(([key, value]) => ({
      key,
      value,
    }));
  });
  informationCols = [
    { field: 'key', header: 'Key' },
    { field: 'value', header: 'Value' },
  ]

  constructor() {
    combineLatest([this.activeRoute.params, this.activeRoute.data])
      .pipe(
        switchMap(([params, data]) => {
          const action = data['action'] as 'create' | 'modify';

          const namespaceId = params['namespaceId'] as UUID | undefined;
          const queueId = params['queueId'] as string | undefined;

          if (namespaceId === undefined) {
            throw new Error('Namespace ID is required');
          }

          if (action === 'create') {
            return of({ action: 'create', queue: undefined });
          }

          // new queue form
          if (!queueId) {
            throw new Error('Queue ID is required for modify action');
          }
          this.configureFormAsEdit();

          return this.store
            .select(TopologySelectors.selectQueueById(namespaceId, queueId))
            .pipe(
              map((queue) => ({
                action: 'modify',
                queue,
              }))
            );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(({ action, queue }) => {
        this.form = this.createForm();
        this.action.set(action as 'create' | 'modify');
        this.currentQueue.set(queue);

        if (action === 'create') {
          this.configureFormAsCreate();
          return;
        }

        this.configureFormAsEdit();
        if (!queue) {
          return;
        }

        this.form.setValue(
          {
            name: queue.name,
            properties: queue.properties,
            settings: queue.settings,
          },
          { emitEvent: false }
        );
      });
  }

  configureFormAsEdit(): void {
    this.form.controls.name.disable();
    this.form.controls.settings.controls.enablePartitioning.disable();
    this.form.controls.settings.controls.enableExpress.disable();
    this.form.controls.settings.controls.requiresSession.disable();
    this.form.controls.settings.controls.requiresDuplicateDetection.disable();
  }

  configureFormAsCreate(): void {
    this.form.controls.name.enable();
    this.form.controls.settings.controls.enablePartitioning.enable();
    this.form.controls.settings.controls.enableExpress.enable();
    this.form.controls.settings.controls.requiresSession.enable();
    this.form.controls.settings.controls.requiresDuplicateDetection.enable();
    this.form.controls.properties.controls.autoDeleteOnIdle.enable();
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();

    const queue: Queue = {
      id: formValue.name ?? '',
      namespaceId: this.activeRoute.snapshot.params['namespaceId'],
      name: formValue.name ?? '',
      properties: {
        lockDuration: formValue.properties.lockDuration ?? '',
        maxSizeInMegabytes: formValue.properties.maxSizeInMegabytes ?? 0,
        defaultMessageTimeToLive:
          formValue.properties.defaultMessageTimeToLive ?? '',
        duplicateDetectionHistoryTimeWindow:
          formValue.properties.duplicateDetectionHistoryTimeWindow ?? '',
        maxDeliveryCount: formValue.properties.maxDeliveryCount ?? 0,
        userMetadata: formValue.properties.userMetadata ?? null,
        autoDeleteOnIdle: formValue.properties.autoDeleteOnIdle ?? '',
        forwardMessagesTo: formValue.properties.forwardMessagesTo ?? null,
        forwardDeadLetteredMessagesTo:
          formValue.properties.forwardDeadLetteredMessagesTo ?? null,
      },
      settings: {
        requiresDuplicateDetection:
          formValue.settings.requiresDuplicateDetection ?? false,
        requiresSession: formValue.settings.requiresSession ?? false,
        deadLetteringOnMessageExpiration:
          formValue.settings.deadLetteringOnMessageExpiration ?? false,
        enableBatchedOperations:
          formValue.settings.enableBatchedOperations ?? false,
        enableExpress: formValue.settings.enableExpress ?? false,
        enablePartitioning: formValue.settings.enablePartitioning ?? false,
      },
    };

    // save queue
    if (this.action() === 'create') {
      this.store.dispatch(
        TopologyActions.addQueue({
          namespaceId: this.activeRoute.snapshot.params['namespaceId'],
          queue: queue,
        })
      );
      return;
    }

    // update queue
    this.store.dispatch(
      TopologyActions.editQueue({
        namespaceId: this.activeRoute.snapshot.params['namespaceId'],
        queue: queue,
      })
    );
  }

  isDate(value: unknown): boolean {
    return value instanceof Date;
  }

  private createForm() {
    return new FormGroup<QueueForm>({
      name: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      properties: new FormGroup({
        maxSizeInMegabytes: new FormControl<number>(1024, {
          validators: [Validators.required],
          nonNullable: true,
        }),
        maxDeliveryCount: new FormControl<number>(10, {
          validators: [Validators.required],
          nonNullable: true,
        }),
        userMetadata: new FormControl<string | null>(''),
        forwardMessagesTo: new FormControl<string | null>(null),
        forwardDeadLetteredMessagesTo: new FormControl<string | null>(null),
        duplicateDetectionHistoryTimeWindow: new FormControl<string>(''),
        autoDeleteOnIdle: new FormControl<string>(''),
        defaultMessageTimeToLive: new FormControl<string>('P14D'),
        lockDuration: new FormControl<string>('PT1M'),
      }),
      settings: new FormGroup({
        enableBatchedOperations: new FormControl<boolean>(false, {
          nonNullable: true,
        }),
        deadLetteringOnMessageExpiration: new FormControl<boolean>(true, {
          nonNullable: true,
        }),
        enablePartitioning: new FormControl<boolean>(false, {
          nonNullable: true,
        }),
        enableExpress: new FormControl<boolean>(false, { nonNullable: true }),
        requiresDuplicateDetection: new FormControl<boolean>(false, {
          nonNullable: true,
        }),
        requiresSession: new FormControl<boolean>(false, { nonNullable: true }),
      }),
    });
  }

  protected readonly Date = Date;
}
