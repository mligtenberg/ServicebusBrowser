import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import { EndpointSelectorInputComponent } from '@service-bus-browser/topology-components';
import { FloatLabel } from 'primeng/floatlabel';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { QueueForm } from '../queue-management/form';
import { SubscriptionForm } from './form';
import { Textarea } from 'primeng/textarea';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { TopologySelectors } from '@service-bus-browser/topology-store';

@Component({
  selector: 'lib-subscription-management',
  imports: [
    CommonModule,
    Card,
    Checkbox,
    DurationInputComponent,
    EndpointSelectorInputComponent,
    FloatLabel,
    FormsModule,
    InputNumber,
    InputText,
    ReactiveFormsModule,
    Textarea,
  ],
  templateUrl: './subscription-management.component.html',
  styleUrl: './subscription-management.component.scss',
})
export class SubscriptionManagementComponent {
  destroy$ = new Subject<void>();
  newParams$ = new Subject<void>();
  activeRoute = inject(ActivatedRoute);
  store = inject(Store);
  form = new FormGroup<SubscriptionForm>({
    name: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    properties: new FormGroup({
      maxDeliveryCount: new FormControl<number>(0, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      userMetadata: new FormControl<string | null>(''),
      forwardMessagesTo: new FormControl<string | null>(''),
      forwardDeadLetteredMessagesTo: new FormControl<string | null>(''),
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
      deadLetteringOnFilterEvaluationExceptions: new FormControl<boolean>(
        false,
        {
          nonNullable: true,
        }
      ),
      requiresSession: new FormControl<boolean>(false, { nonNullable: true }),
    }),
  });

  constructor() {
    this.activeRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const namespaceId = params['namespaceId'] as UUID | undefined;
        const topicId = params['topicId'] as string | undefined;
        const subscriptionId = params['subscriptionId'] as string | undefined;

        this.newParams$.next();
        this.newParams$.complete();
        this.newParams$ = new Subject<void>();

        // new queue form
        if (!namespaceId || !topicId || !subscriptionId) {
          this.form.reset();
          this.configureFormAsCreate();
          return;
        }
        this.configureFormAsEdit();

        this.store
          .select(TopologySelectors.selectSubscriptionById(namespaceId, topicId, subscriptionId))
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
    this.form.controls.settings.controls.requiresSession.disable();
    this.form.controls.properties.controls.autoDeleteOnIdle.disable();
  }

  configureFormAsCreate(): void {
    this.form.controls.name.enable();
    this.form.controls.settings.controls.requiresSession.enable();
    this.form.controls.properties.controls.autoDeleteOnIdle.enable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
