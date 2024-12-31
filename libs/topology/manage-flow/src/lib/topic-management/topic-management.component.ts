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
import { TopicForm } from './form';
import { Textarea } from 'primeng/textarea';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { TopologyActions, TopologySelectors } from '@service-bus-browser/topology-store';
import { latestValueFrom } from 'nx/src/adapter/rxjs-for-await';
import { ButtonDirective } from 'primeng/button';
import { Queue, Topic } from '@service-bus-browser/topology-contracts';

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
  ],
  templateUrl: './topic-management.component.html',
  styleUrl: './topic-management.component.scss',
})
export class TopicManagementComponent {
  destroy$ = new Subject<void>();
  newParams$ = new Subject<void>();
  activeRoute = inject(ActivatedRoute);
  store = inject(Store);
  form = this.createForm();
  action: 'create' | 'modify' = 'create';

  constructor() {
    combineLatest([this.activeRoute.params, this.activeRoute.data])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, data]) => {
        const namespaceId = params['namespaceId'] as UUID | undefined;
        const topicId = params['topicId'] as string | undefined;
        this.action = data['action'] as 'create' | 'modify';

        this.newParams$.next();
        this.newParams$.complete();
        this.newParams$ = new Subject<void>();

        if (namespaceId === undefined) {
          throw new Error('Namespace ID is required');
        }

        // new queue form
        if (this.action === 'create') {
          this.form = this.createForm();
          this.configureFormAsCreate();
          return;
        }

        if (topicId === undefined) {
          throw new Error('Topic ID is required for modify action');
        }

        this.configureFormAsEdit();

        this.store
          .select(TopologySelectors.selectTopicById(namespaceId, topicId))
          .pipe(takeUntil(this.newParams$), takeUntil(this.destroy$))
          .subscribe((topic) => {
            if (!topic) {
              return;
            }

            this.form.setValue(
              {
                name: topic.name,
                properties: topic.properties,
                settings: topic.settings,
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
    this.form.controls.settings.controls.requiresDuplicateDetection.disable();
  }

  configureFormAsCreate(): void {
    this.form.controls.name.enable();
    this.form.controls.settings.controls.enablePartitioning.enable();
    this.form.controls.settings.controls.enableExpress.enable();
    this.form.controls.settings.controls.requiresDuplicateDetection.enable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.getRawValue();

    const topic: Topic = {
      id: formValue.name ?? '',
      namespaceId: this.activeRoute.snapshot.params['namespaceId'],
      name: formValue.name ?? '',
      properties: {
        maxSizeInMegabytes: formValue.properties.maxSizeInMegabytes ?? 0,
        defaultMessageTimeToLive: formValue.properties.defaultMessageTimeToLive ?? '',
        duplicateDetectionHistoryTimeWindow: formValue.properties.duplicateDetectionHistoryTimeWindow ?? '',
        userMetadata: formValue.properties.userMetadata ?? null,
        autoDeleteOnIdle: formValue.properties.autoDeleteOnIdle ?? '',
      },
      settings: {
        requiresDuplicateDetection: formValue.settings.requiresDuplicateDetection ?? false,
        supportOrdering: formValue.settings.supportOrdering ?? false,
        enableBatchedOperations: formValue.settings.enableBatchedOperations ?? false,
        enableExpress: formValue.settings.enableExpress ?? false,
        enablePartitioning: formValue.settings.enablePartitioning ?? false,
      },
    }

    // save queue
    if (this.action === 'create') {
      this.store.dispatch(
        TopologyActions.addTopic({
          namespaceId: this.activeRoute.snapshot.params['namespaceId'],
          topic
        })
      );
      return;
    }

    // update queue
    this.store.dispatch(
      TopologyActions.editTopic({
        namespaceId: this.activeRoute.snapshot.params['namespaceId'],
        topic
      })
    );
  }
}
