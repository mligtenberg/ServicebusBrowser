import { Component, inject, OnDestroy } from '@angular/core';
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
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import {
  TopologyActions,
  TopologySelectors,
} from '@service-bus-browser/topology-store';
import { ButtonDirective } from 'primeng/button';
import { Subscription } from '@service-bus-browser/topology-contracts';

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
    ButtonDirective,
  ],
  templateUrl: './subscription-management.component.html',
  styleUrl: './subscription-management.component.scss',
})
export class SubscriptionManagementComponent implements OnDestroy {
  destroy$ = new Subject<void>();
  newParams$ = new Subject<void>();
  activeRoute = inject(ActivatedRoute);
  store = inject(Store);
  form = this.createForm();
  action: 'create' | 'modify' = 'create';

  constructor() {
    combineLatest([this.activeRoute.params, this.activeRoute.data])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([ params, data ]) => {
        this.action = data['action'] as 'create' | 'modify';
        this.form = this.createForm();

        const namespaceId = params['namespaceId'] as UUID | undefined;
        const topicId = params['topicId'] as string | undefined;
        const subscriptionId = params['subscriptionId'] as string | undefined;

        if (namespaceId === undefined) {
          throw new Error('Namespace ID is required');
        }

        if (topicId === undefined) {
          throw new Error('Topic ID is required');
        }

        if (this.action === 'create') {
          this.configureFormAsCreate();
          return;
        }

        this.newParams$.next();
        this.newParams$.complete();
        this.newParams$ = new Subject<void>();

        if (!subscriptionId) {
          throw new Error('Subscription ID is required for modify action');
        }
        this.configureFormAsEdit();

        this.store
          .select(
            TopologySelectors.selectSubscriptionById(
              namespaceId,
              topicId,
              subscriptionId
            )
          )
          .pipe(takeUntil(this.newParams$), takeUntil(this.destroy$))
          .subscribe((queue) => {
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
      });
  }

  configureFormAsEdit(): void {
    this.form.controls.name.disable();
    this.form.controls.settings.controls.requiresSession.disable();
  }

  configureFormAsCreate(): void {
    this.form.controls.name.enable();
    this.form.controls.settings.controls.requiresSession.enable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();

    const subscription: Subscription = {
      id: formValue.name ?? '',
      namespaceId: this.activeRoute.snapshot.params['namespaceId'],
      topicId: this.activeRoute.snapshot.params['topicId'],
      name: formValue.name ?? '',
      properties: {
        lockDuration: formValue.properties.lockDuration ?? '',
        defaultMessageTimeToLive: formValue.properties.defaultMessageTimeToLive ?? '',
        maxDeliveryCount: formValue.properties.maxDeliveryCount ?? 0,
        userMetadata: formValue.properties.userMetadata ?? null,
        autoDeleteOnIdle: formValue.properties.autoDeleteOnIdle ?? '',
        forwardMessagesTo: formValue.properties.forwardMessagesTo ?? null,
        forwardDeadLetteredMessagesTo: formValue.properties.forwardDeadLetteredMessagesTo ?? null,
      },
      settings: {
        requiresSession: formValue.settings.requiresSession ?? false,
        deadLetteringOnMessageExpiration: formValue.settings.deadLetteringOnMessageExpiration ?? false,
        enableBatchedOperations: formValue.settings.enableBatchedOperations ?? false,
        deadLetteringOnFilterEvaluationExceptions: formValue.settings.deadLetteringOnFilterEvaluationExceptions ?? false,
      },
    }

    // save queue
    if (this.action === 'create') {
      this.store.dispatch(
        TopologyActions.addSubscription({
          namespaceId: this.activeRoute.snapshot.params['namespaceId'],
          topicId: this.activeRoute.snapshot.params['topicId'],
          subscription: subscription
        })
      );
      return;
    }

    // update queue
    this.store.dispatch(
      TopologyActions.editSubscription({
        namespaceId: this.activeRoute.snapshot.params['namespaceId'],
        topicId: this.activeRoute.snapshot.params['topicId'],
        subscription
      })
    );
  }

  private createForm() {
    return new FormGroup<SubscriptionForm>({
      name: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      properties: new FormGroup({
        maxDeliveryCount: new FormControl<number>(10, {
          validators: [Validators.required],
          nonNullable: true,
        }),
        userMetadata: new FormControl<string | null>(null),
        forwardMessagesTo: new FormControl<string | null>(null),
        forwardDeadLetteredMessagesTo: new FormControl<string | null>(null),
        autoDeleteOnIdle: new FormControl<string>(''),
        defaultMessageTimeToLive: new FormControl<string>('P14D'),
        lockDuration: new FormControl<string>('PT1M'),
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
  }
}
