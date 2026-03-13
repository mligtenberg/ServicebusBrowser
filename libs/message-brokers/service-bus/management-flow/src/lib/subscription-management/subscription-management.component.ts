import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import {
  EndpointStringSelectorInputComponent
} from '@service-bus-browser/topology-components';
import { FloatLabel } from 'primeng/floatlabel';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { SubscriptionForm } from './form';
import { Textarea } from 'primeng/textarea';
import { combineLatest, from, map, of, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ButtonDirective } from 'primeng/button';
import { Subscription, SubscriptionWithMetaData } from '@service-bus-browser/service-bus-api-contracts';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ServiceBusManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';

@Component({
  selector: 'lib-subscription-management',
  imports: [
    CommonModule,
    Card,
    Checkbox,
    DurationInputComponent,
    FloatLabel,
    FormsModule,
    InputNumber,
    InputText,
    ReactiveFormsModule,
    Textarea,
    ButtonDirective,
    PrimeTemplate,
    TableModule,
    EndpointStringSelectorInputComponent,
  ],
  templateUrl: './subscription-management.component.html',
  styleUrl: './subscription-management.component.scss',
})
export class SubscriptionManagementComponent {
  activeRoute = inject(ActivatedRoute);
  managementClient = inject(ServiceBusManagementFrontendClient);
  form = this.createForm();
  action = signal<'create' | 'modify'>('create');
  currentSubscription = signal<SubscriptionWithMetaData | undefined>(undefined);
  currentSubscriptionInformation = computed(() => {
    const subscription = this.currentSubscription();
    if (!subscription) {
      return [];
    }

    return Object.entries(subscription.metaData).map(([key, value]) => ({
      key,
      value,
    }));
  });
  endpointFilter = computed(() => {
    const currentSubscription = this.currentSubscription();
    if (!currentSubscription) {
      return [];
    }

    return [currentSubscription.connectionId];
  });

  informationCols = [
    { field: 'key', header: 'Key' },
    { field: 'value', header: 'Value' },
  ];

  constructor() {
    combineLatest([this.activeRoute.params, this.activeRoute.data])
      .pipe(
        switchMap(([params, data]) => {
          const action = data['action'] as 'create' | 'modify';
          const connectionId = params['connectionId'] as UUID | undefined;
          const topicId = params['topicId'] as string | undefined;
          const subscriptionId = params['subscriptionId'] as string | undefined;

          if (connectionId === undefined) {
            throw new Error('Namespace ID is required');
          }

          if (topicId === undefined) {
            throw new Error('Topic ID is required');
          }

          if (action === 'create') {
            return of({ action, subscription: undefined });
          }

          if (!subscriptionId) {
            throw new Error('Subscription ID is required for modify action');
          }

          return from(this.managementClient.getSubscription(connectionId, topicId, subscriptionId))
            .pipe(map((subscription) => ({ action, subscription })));
        }),
        takeUntilDestroyed(),
      )
      .subscribe(({ action, subscription }) => {
        this.action.set(action);
        this.currentSubscription.set(subscription);
        this.form = this.createForm();

        if (action === 'create') {
          this.configureFormAsCreate();
          return;
        }

        this.configureFormAsEdit();

        if (!subscription) {
          return;
        }

        this.form.setValue(
          {
            name: subscription.name,
            properties: subscription.properties,
            settings: subscription.settings,
          },
          { emitEvent: false },
        );
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

  async save(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();

    const subscription: Subscription = {
      id: formValue.name ?? '',
      connectionId: this.activeRoute.snapshot.params['connectionId'],
      topicId: this.activeRoute.snapshot.params['topicId'],
      name: formValue.name ?? '',
      properties: {
        lockDuration: formValue.properties.lockDuration ?? '',
        defaultMessageTimeToLive:
          formValue.properties.defaultMessageTimeToLive ?? '',
        maxDeliveryCount: formValue.properties.maxDeliveryCount ?? 0,
        userMetadata: formValue.properties.userMetadata ?? null,
        autoDeleteOnIdle: formValue.properties.autoDeleteOnIdle ?? '',
        forwardMessagesTo: formValue.properties.forwardMessagesTo ?? null,
        forwardDeadLetteredMessagesTo:
          formValue.properties.forwardDeadLetteredMessagesTo ?? null,
      },
      settings: {
        requiresSession: formValue.settings.requiresSession ?? false,
        deadLetteringOnMessageExpiration:
          formValue.settings.deadLetteringOnMessageExpiration ?? false,
        enableBatchedOperations:
          formValue.settings.enableBatchedOperations ?? false,
        deadLetteringOnFilterEvaluationExceptions:
          formValue.settings.deadLetteringOnFilterEvaluationExceptions ?? false,
      },
    };

    // save queue
    if (this.action() === 'create') {
      await this.managementClient.createSubscription(
        this.activeRoute.snapshot.params['connectionId'],
        this.activeRoute.snapshot.params['topicId'],
        subscription
      );
      return;
    }

    // update queue
    await this.managementClient.editSubscription(
      this.activeRoute.snapshot.params['connectionId'],
      this.activeRoute.snapshot.params['topicId'],
      subscription
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
        deadLetteringOnMessageExpiration: new FormControl<boolean>(true, {
          nonNullable: true,
        }),
        deadLetteringOnFilterEvaluationExceptions: new FormControl<boolean>(
          false,
          {
            nonNullable: true,
          },
        ),
        requiresSession: new FormControl<boolean>(false, { nonNullable: true }),
      }),
    });
  }

  isDate(value: unknown): boolean {
    return value instanceof Date;
  }
}
