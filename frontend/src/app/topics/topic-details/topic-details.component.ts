import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { IFormBuilder, IFormGroup } from '@rxweb/types';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { State } from 'src/app/ngrx.module';
import { ITopicDetailsForm } from '../models/ITopicDetailsForm';
import { updateTopic } from '../ngrx/topics.actions';
import { ITopic } from '../ngrx/topics.models';
import { getTopic } from '../ngrx/topics.selectors';

@Component({
  selector: 'app-topic-details',
  templateUrl: './topic-details.component.html',
  styleUrls: ['./topic-details.component.scss']
})
export class TopicDetailsComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  connectionId: string;
  topic: ITopic;
  form: IFormGroup<ITopicDetailsForm>;
  formBuilder: IFormBuilder;

  constructor(
    private activeRoute: ActivatedRoute,
    private store: Store<State>,
    formBuilder: UntypedFormBuilder
    ) { 
      this.formBuilder = formBuilder;

      this.form = this.formBuilder.group<ITopicDetailsForm>({
        name: new UntypedFormControl({value: '', disabled: true}),
        defaultMessageTimeToLive: new UntypedFormControl({value: ''}),
        enableBatchedOperations: new UntypedFormControl({value: false}),
        userMetadata: new UntypedFormControl({value: ''}),
        autoDeleteOnIdle: new UntypedFormControl({value: ''}),
        maxSizeInMegabytes: new UntypedFormControl({value: 0}),
        requiresDuplicateDetection: new UntypedFormControl({value: false, disabled: true}),
        duplicateDetectionHistoryTimeWindow: new UntypedFormControl({value: ''}),
        supportOrdering: new UntypedFormControl({value: false}),
        enablePartitioning: new UntypedFormControl({value: false, disabled: true}),
        enableExpress: new UntypedFormControl({value: false, disabled: true}),
      });
    }

  ngOnInit(): void {
    this.subs.add(this.activeRoute.params.subscribe(params => {
      this.connectionId = params.connectionId;

      this.store.select(getTopic(params.connectionId, params.topicName))
      .pipe(first())
      .subscribe(t => {
        this.topic = t;
        this.form.setValue({
          name: t.name ?? '',
          defaultMessageTimeToLive: t.properties.defaultMessageTimeToLive,
          enableBatchedOperations: t.properties.enableBatchedOperations,
          userMetadata: t.properties.userMetadata ?? '',
          autoDeleteOnIdle: t.properties.autoDeleteOnIdle,
          maxSizeInMegabytes: t.properties.maxSizeInMegabytes,
          requiresDuplicateDetection: t.properties.requiresDuplicateDetection,
          duplicateDetectionHistoryTimeWindow: t.properties.duplicateDetectionHistoryTimeWindow,
          supportOrdering: t.properties.supportOrdering,
          enablePartitioning: t.properties.enablePartitioning,
          enableExpress: t.properties.enableExpress
        });
      })
    }));
  }

  save() {
    const formValue = this.form.value;

    this.store.dispatch(updateTopic({
      connectionId: this.connectionId,
      topic: {
        name: this.topic.name,
        info: this.topic.info,
        properties: {
          autoDeleteOnIdle: formValue.autoDeleteOnIdle,
          defaultMessageTimeToLive: formValue.defaultMessageTimeToLive,
          duplicateDetectionHistoryTimeWindow: formValue.duplicateDetectionHistoryTimeWindow,
          enableBatchedOperations: formValue.enableBatchedOperations,
          enableExpress: formValue.enableExpress,
          enablePartitioning: formValue.enablePartitioning,
          maxSizeInMegabytes: formValue.maxSizeInMegabytes,
          requiresDuplicateDetection: formValue.requiresDuplicateDetection,
          supportOrdering: formValue.supportOrdering,
          userMetadata: formValue.userMetadata
        }
      }
    }))
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}