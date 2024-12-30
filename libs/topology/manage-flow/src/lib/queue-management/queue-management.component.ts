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
    name: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    properties: new FormGroup({
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
    settings: new FormGroup({
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
              name: queue.name,
              properties: queue.properties,
              settings: queue.settings
            }, { emitEvent: false });
          });
      });
  }

  configureFormAsEdit(): void {
    this.form.controls.name.disable();
    this.form.controls.settings.controls.enablePartitioning.disable();
    this.form.controls.settings.controls.enableExpress.disable();
    this.form.controls.settings.controls.requiresSession.disable();
    this.form.controls.settings.controls.requiresDuplicateDetection.disable();
    this.form.controls.properties.controls.autoDeleteOnIdle.disable();
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
}