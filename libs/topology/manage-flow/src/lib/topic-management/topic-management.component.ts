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
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { UUID } from '@service-bus-browser/shared-contracts';
import { TopologySelectors } from '@service-bus-browser/topology-store';

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
  ],
  templateUrl: './topic-management.component.html',
  styleUrl: './topic-management.component.scss',
})
export class TopicManagementComponent {
  destroy$ = new Subject<void>();
  newParams$ = new Subject<void>();
  activeRoute = inject(ActivatedRoute);
  store = inject(Store);
  form = new FormGroup<TopicForm>({
    name: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    properties: new FormGroup({
      maxSizeInMegabytes: new FormControl<number>(0, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      userMetadata: new FormControl<string | null>(''),
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

  constructor() {
    this.activeRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const namespaceId = params['namespaceId'] as UUID | undefined;
        const topicId = params['topicId'] as string | undefined;

        this.newParams$.next();
        this.newParams$.complete();
        this.newParams$ = new Subject<void>();

        // new queue form
        if (!namespaceId || !topicId) {
          this.form.reset();
          this.configureFormAsCreate();
          return;
        }
        this.configureFormAsEdit();

        this.store
          .select(TopologySelectors.selectTopicById(namespaceId, topicId))
          .pipe(
            takeUntil(this.newParams$),
            takeUntil(this.destroy$)
          )
          .subscribe((topic) => {
            if (!topic) {
              return;
            }

            this.form.setValue({
              name: topic.name,
              properties: topic.properties,
              settings: topic.settings
            }, { emitEvent: false });
          });
      });
  }

  configureFormAsEdit(): void {
    this.form.controls.name.disable();
    this.form.controls.settings.controls.enablePartitioning.disable();
    this.form.controls.settings.controls.enableExpress.disable();
    this.form.controls.settings.controls.requiresDuplicateDetection.disable();
    this.form.controls.properties.controls.autoDeleteOnIdle.disable();
  }

  configureFormAsCreate(): void {
    this.form.controls.name.enable();
    this.form.controls.settings.controls.enablePartitioning.enable();
    this.form.controls.settings.controls.enableExpress.enable();
    this.form.controls.settings.controls.requiresDuplicateDetection.enable();
    this.form.controls.properties.controls.autoDeleteOnIdle.enable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
