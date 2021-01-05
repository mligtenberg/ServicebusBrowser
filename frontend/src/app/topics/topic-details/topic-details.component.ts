import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { State } from 'src/app/ngrx.module';
import { ITopic } from '../ngrx/topics.models';
import { getTopic } from '../ngrx/topics.selectors';

@Component({
  selector: 'app-topic-details',
  templateUrl: './topic-details.component.html',
  styleUrls: ['./topic-details.component.scss']
})
export class TopicDetailsComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  topic: ITopic;
  form: FormGroup;

  constructor(
    private activeRoute: ActivatedRoute,
    private store: Store<State>,
    private formBuilder: FormBuilder
    ) { 
      this.form = this.formBuilder.group({
        name: new FormControl({value: '', disabled: true}),
        defaultMessageTimeToLive: new FormControl({value: '', disabled: true}),
        enableBatchedOperations: new FormControl({value: '', disabled: true}),
        userMetadata: new FormControl({value: '', disabled: true}),
        autoDeleteOnIdle: new FormControl({value: '', disabled: true}),
        maxSizeInMegabytes: new FormControl({value: 0, disabled: true}),
        requiresDuplicateDetection: new FormControl({value: false, disabled: true}),
        duplicateDetectionHistoryTimeWindow: new FormControl({value: '', disabled: true}),
        supportOrdering: new FormControl({value: false, disabled: true}),
        enablePartitioning: new FormControl({value: false, disabled: true}),
        enableExpress: new FormControl({value: false, disabled: true}),
      });
    }

  ngOnInit(): void {
    this.subs.add(this.activeRoute.params.subscribe(params => {
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}