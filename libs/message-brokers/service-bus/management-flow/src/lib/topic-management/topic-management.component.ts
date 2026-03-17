import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { DurationInputComponent } from '@service-bus-browser/shared-components';
import { FloatLabel } from 'primeng/floatlabel';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { TopicForm } from './form';
import { Textarea } from 'primeng/textarea';
import { combineLatest, from, map, of, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ButtonDirective } from 'primeng/button';
import { Topic, TopicWithMetaData } from '@service-bus-browser/service-bus-api-contracts';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ServiceBusManagementFrontendClient } from '@service-bus-browser/service-bus-frontend-clients';
import { RefreshUtil } from '../refresh-util';

@Component({
  selector: 'lib-topic-management',
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
  ],
  templateUrl: './topic-management.component.html',
  styleUrl: './topic-management.component.scss',
})
export class TopicManagementComponent {
  activeRoute = inject(ActivatedRoute);
  managementClient = inject(ServiceBusManagementFrontendClient);
  refreshUtil = inject(RefreshUtil);
  form = this.createForm();

  action = signal<'create' | 'modify'>('create');
  currentTopic = signal<TopicWithMetaData | undefined>(undefined);
  currentTopicInformation = computed(() => {
    const topic = this.currentTopic();
    if (!topic) {
      return [];
    }

    return Object.entries(topic.metadata).map(([key, value]) => ({
      key,
      value,
    }));
  });

  informationCols = [
    { field: 'key', header: 'Key' },
    { field: 'value', header: 'Value' },
  ];

  constructor() {
    combineLatest([this.activeRoute.params, this.activeRoute.data])
      .pipe(
        switchMap(([params, data]) => {
          const connectionId = params['connectionId'] as UUID | undefined;
          const topicId = params['topicId'] as string | undefined;
          const action = data['action'] as 'create' | 'modify';

          if (connectionId === undefined) {
            throw new Error('Namespace ID is required');
          }

          if (action === 'create') {
            return of({ action: action, topic: undefined });
          }

          if (topicId === undefined) {
            throw new Error('Topic ID is required for modify action');
          }

          return from(
            this.managementClient.getTopic(connectionId, topicId),
          ).pipe(map((topic) => ({ action: action, topic: topic })));
        }),
        takeUntilDestroyed(),
      )
      .subscribe(({ topic, action }) => {
        this.action.set(action);
        this.currentTopic.set(topic);

        // new queue form
        if (action === 'create') {
          this.form = this.createForm();
          this.configureFormAsCreate();
          return;
        }

        this.configureFormAsEdit();

        if (!topic) {
          return;
        }

        this.form.setValue(
          {
            name: topic.name,
            properties: topic.properties,
            settings: topic.settings,
          },
          { emitEvent: false },
        );
      });
  }

  configureFormAsEdit(): void {
    this.form.controls.name.disable();
    this.form.controls.settings.controls.enablePartitioning.disable();
    this.form.controls.settings.controls.enableExpress.disable();
    this.form.controls.settings.controls.requiresDuplicateDetection.disable();
  }

  configureFormAsCreate(): void {
    this.form.controls.name.enable();
    this.form.controls.settings.controls.enablePartitioning.enable();
    this.form.controls.settings.controls.enableExpress.enable();
    this.form.controls.settings.controls.requiresDuplicateDetection.enable();
  }

  createForm() {
    return new FormGroup<TopicForm>({
      name: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      properties: new FormGroup({
        maxSizeInMegabytes: new FormControl<number>(1024, {
          validators: [Validators.required],
          nonNullable: true,
        }),
        userMetadata: new FormControl<string | null>(''),
        duplicateDetectionHistoryTimeWindow: new FormControl<string>('', {
          nonNullable: true,
        }),
        autoDeleteOnIdle: new FormControl<string>('', {
          nonNullable: true,
        }),
        defaultMessageTimeToLive: new FormControl<string>('P14D', {
          nonNullable: true,
        }),
      }),
      settings: new FormGroup({
        enableBatchedOperations: new FormControl<boolean>(false, {
          nonNullable: true,
        }),
        enablePartitioning: new FormControl<boolean>(false, {
          nonNullable: true,
        }),
        supportOrdering: new FormControl<boolean>(false, { nonNullable: true }),
        enableExpress: new FormControl<boolean>(false, { nonNullable: true }),
        requiresDuplicateDetection: new FormControl<boolean>(false, {
          nonNullable: true,
        }),
      }),
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();

    const topic: Topic = {
      id: formValue.name ?? '',
      connectionId: this.activeRoute.snapshot.params['connectionId'],
      name: formValue.name ?? '',
      properties: {
        maxSizeInMegabytes: formValue.properties.maxSizeInMegabytes ?? 0,
        defaultMessageTimeToLive:
          formValue.properties.defaultMessageTimeToLive ?? '',
        duplicateDetectionHistoryTimeWindow:
          formValue.properties.duplicateDetectionHistoryTimeWindow ?? '',
        userMetadata: formValue.properties.userMetadata ?? null,
        autoDeleteOnIdle: formValue.properties.autoDeleteOnIdle ?? '',
      },
      settings: {
        requiresDuplicateDetection:
          formValue.settings.requiresDuplicateDetection ?? false,
        supportOrdering: formValue.settings.supportOrdering ?? false,
        enableBatchedOperations:
          formValue.settings.enableBatchedOperations ?? false,
        enableExpress: formValue.settings.enableExpress ?? false,
        enablePartitioning: formValue.settings.enablePartitioning ?? false,
      },
    };

    // save queue
    if (this.action() === 'create') {
      await this.managementClient.createTopic(
        this.activeRoute.snapshot.params['connectionId'],
        topic,
      );
      this.refreshUtil.refreshTopics(this.activeRoute.snapshot.params['connectionId'] as UUID);
      return;
    }

    // update queue
    await this.managementClient.editTopic(
      this.activeRoute.snapshot.params['connectionId'],
      topic,
    );
    this.refreshUtil.refreshTopics(this.activeRoute.snapshot.params['connectionId'] as UUID);
  }

  isDate(value: unknown): boolean {
    return value instanceof Date;
  }
}
