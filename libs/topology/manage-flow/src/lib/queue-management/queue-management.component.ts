import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QueueForm } from './form';
import { Store } from '@ngrx/store';
import {
  TopologyActions,
  TopologySelectors,
} from '@service-bus-browser/topology-store';
import { combineLatest, Subject, takeUntil } from 'rxjs';
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
  ],
  templateUrl: './queue-management.component.html',
  styleUrl: './queue-management.component.scss',
})
export class QueueManagementComponent implements OnDestroy {
  destroy$ = new Subject<void>();
  newParams$ = new Subject<void>();
  activeRoute = inject(ActivatedRoute);
  store = inject(Store);
  form = new FormGroup<QueueForm>({
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
  action: 'create' | 'modify' = 'create';

  constructor() {
    combineLatest([this.activeRoute.params, this.activeRoute.data])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([ params, data ]) => {
        this.action = data['action'] as 'create' | 'modify';

        const namespaceId = params['namespaceId'] as UUID | undefined;
        const queueId = params['queueId'] as string | undefined;

        if (namespaceId === undefined) {
          throw new Error('Namespace ID is required');
        }

        if (this.action === 'create') {
          console.log('Create new queue');
          this.form.reset();
          this.configureFormAsCreate();
          return;
        }

        console.log('Modify queue', queueId);

        this.newParams$.next();
        this.newParams$.complete();
        this.newParams$ = new Subject<void>();

        // new queue form
        if (!queueId) {
          throw new Error('Queue ID is required for modify action');
        }
        this.configureFormAsEdit();

        this.store
          .select(TopologySelectors.selectQueueById(namespaceId, queueId))
          .pipe(takeUntil(this.newParams$), takeUntil(this.destroy$))
          .subscribe((queue) => {
            if (!queue) {
              return;
            }

            console.log('Queue', queue);

            this.form.setValue(
              {
                name: queue.name,
                properties: queue.properties,
                settings: queue.settings,
              },
              { emitEvent: false }
            );
          });
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    // save queue
    if (this.action === 'create') {
      this.store.dispatch(
        TopologyActions.addQueue({
          namespaceId: this.activeRoute.snapshot.params['namespaceId'],
          queue: {
            id: '',
            namespaceId: this.activeRoute.snapshot.params['namespaceId'],
            name: this.form.value.name ?? '',
            properties: {
              lockDuration: this.form.value.properties?.lockDuration ?? '',
              maxSizeInMegabytes: this.form.value.properties?.maxSizeInMegabytes ?? 0,
              defaultMessageTimeToLive: this.form.value.properties?.defaultMessageTimeToLive ?? '',
              duplicateDetectionHistoryTimeWindow: this.form.value.properties?.duplicateDetectionHistoryTimeWindow ?? '',
              maxDeliveryCount: this.form.value.properties?.maxDeliveryCount ?? 0,
              userMetadata: this.form.value.properties?.userMetadata ?? null,
              autoDeleteOnIdle: this.form.value.properties?.autoDeleteOnIdle ?? '',
              forwardMessagesTo: this.form.value.properties?.forwardMessagesTo ?? null,
              forwardDeadLetteredMessagesTo: this.form.value.properties?.forwardDeadLetteredMessagesTo ?? null,
            },
            settings: {
              requiresDuplicateDetection: this.form.value.settings?.requiresDuplicateDetection ?? false,
              requiresSession: this.form.value.settings?.requiresSession ?? false,
              deadLetteringOnMessageExpiration: this.form.value.settings?.deadLetteringOnMessageExpiration ?? false,
              enableBatchedOperations: this.form.value.settings?.enableBatchedOperations ?? false,
              enableExpress: this.form.value.settings?.enableExpress ?? false,
              enablePartitioning: this.form.value.settings?.enablePartitioning ?? false,
            },

          }
        })
      );
      return;
    }
  }
}
