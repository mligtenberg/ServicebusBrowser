import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
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
    formBuilder: FormBuilder
    ) { 
      this.formBuilder = formBuilder;

      this.form = this.formBuilder.group<ITopicDetailsForm>({
        name: new FormControl({value: '', disabled: true}),
        defaultMessageTimeToLive: new FormControl({value: ''}),
        enableBatchedOperations: new FormControl({value: false}),
        userMetadata: new FormControl({value: ''}),
        autoDeleteOnIdle: new FormControl({value: ''}),
        maxSizeInMegabytes: new FormControl({value: 0}),
        requiresDuplicateDetection: new FormControl({value: false, disabled: true}),
        duplicateDetectionHistoryTimeWindow: new FormControl({value: ''}),
        supportOrdering: new FormControl({value: false}),
        enablePartitioning: new FormControl({value: false, disabled: true}),
        enableExpress: new FormControl({value: false, disabled: true}),
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