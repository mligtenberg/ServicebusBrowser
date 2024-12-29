import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QueueForm } from './form';
import { Store } from '@ngrx/store';
import { TopologySelectors } from '@service-bus-browser/topology-store';
import { Subject, takeUntil } from 'rxjs';
import { UUID } from '@service-bus-browser/shared-contracts';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { InputGroup } from 'primeng/inputgroup';
import { EndpointSelectorInputComponent } from '@service-bus-browser/topology-components';
import { Checkbox } from 'primeng/checkbox';

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
    queueName: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    queueProperties: new FormGroup({
      maxSizeInMegabytes: new FormControl<number>(0, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      maxDeliveryCount: new FormControl<number>(0, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      userMetadata: new FormControl<string | null>(''),
      forwardMessagesTo: new FormControl<string | null>(''),
      forwardDeadLetteredMessagesTo: new FormControl<string | null>(''),
      duplicateDetectionHistoryTimeWindow: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      autoDeleteOnIdle: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      defaultMessageTimeToLive: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      lockDuration: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
    }),
    queueSettings: new FormGroup({
      enableBatchedOperations: new FormControl<boolean>(false, {
        nonNullable: true,
      }),
      deadLetteringOnMessageExpiration: new FormControl<boolean>(false, {
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

  constructor() {
    this.activeRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const namespaceId = params['namespaceId'] as UUID | undefined;
        const queueId = params['queueId'] as string | undefined;

        this.newParams$.next();
        this.newParams$.complete();
        this.newParams$ = new Subject<void>();

        // new queue form
        if (!namespaceId || !queueId) {
          this.form.reset();
          this.configureFormAsCreate();
          return;
        }
        this.configureFormAsEdit();

        this.store
          .select(TopologySelectors.selectQueueById(namespaceId, queueId))
          .pipe(
            takeUntil(this.newParams$),
            takeUntil(this.destroy$)
          )
          .subscribe((queue) => {
            if (!queue) {
              return;
            }

            this.form.setValue({
              queueName: queue.name,
              queueProperties: queue.properties,
              queueSettings: queue.settings
            }, { emitEvent: false });
          });
      });
  }

  configureFormAsEdit(): void {
    this.form.controls.queueName.disable();
    this.form.controls.queueSettings.controls.enablePartitioning.disable();
    this.form.controls.queueSettings.controls.enableExpress.disable();
    this.form.controls.queueSettings.controls.requiresSession.disable();
    this.form.controls.queueSettings.controls.requiresDuplicateDetection.disable();
    this.form.controls.queueProperties.controls.autoDeleteOnIdle.disable();
  }

  configureFormAsCreate(): void {
    this.form.controls.queueName.enable();
    this.form.controls.queueSettings.controls.enablePartitioning.enable();
    this.form.controls.queueSettings.controls.enableExpress.enable();
    this.form.controls.queueSettings.controls.requiresSession.enable();
    this.form.controls.queueSettings.controls.requiresDuplicateDetection.enable();
    this.form.controls.queueProperties.controls.autoDeleteOnIdle.enable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
