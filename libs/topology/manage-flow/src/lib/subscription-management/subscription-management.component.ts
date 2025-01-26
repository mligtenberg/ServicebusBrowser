import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import {
  EndpointSelectorInputComponent,
  EndpointStringSelectorInputComponent
} from '@service-bus-browser/topology-components';
import { FloatLabel } from 'primeng/floatlabel';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { SubscriptionForm } from './form';
import { Textarea } from 'primeng/textarea';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import {
  TopologyActions,
  TopologySelectors,
} from '@service-bus-browser/topology-store';
import { ButtonDirective } from 'primeng/button';
import { Subscription, SubscriptionWithMetaData } from '@service-bus-browser/topology-contracts';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    PrimeTemplate,
    TableModule,
    EndpointStringSelectorInputComponent,
  ],
  templateUrl: './subscription-management.component.html',
  styleUrl: './subscription-management.component.scss',
})
export class SubscriptionManagementComponent {
  activeRoute = inject(ActivatedRoute);
  store = inject(Store);
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

    return [currentSubscription.namespaceId];
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
          const namespaceId = params['namespaceId'] as UUID | undefined;
          const topicId = params['topicId'] as string | undefined;
          const subscriptionId = params['subscriptionId'] as string | undefined;

          if (namespaceId === undefined) {
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

          return this.store
            .select(
              TopologySelectors.selectSubscriptionById(
                namespaceId,
                topicId,
                subscriptionId
              )
            )
            .pipe(map((subscription) => ({ action, subscription })));
        }),
        takeUntilDestroyed()
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
          { emitEvent: false }
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
      this.store.dispatch(
        TopologyActions.addSubscription({
          namespaceId: this.activeRoute.snapshot.params['namespaceId'],
          topicId: this.activeRoute.snapshot.params['topicId'],
          subscription: subscription,
        })
      );
      return;
    }

    // update queue
    this.store.dispatch(
      TopologyActions.editSubscription({
        namespaceId: this.activeRoute.snapshot.params['namespaceId'],
        topicId: this.activeRoute.snapshot.params['topicId'],
        subscription,
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

  isDate(value: unknown): boolean {
    return value instanceof Date;
  }
}
