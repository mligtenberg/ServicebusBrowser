import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { State } from 'src/app/ngrx.module';
import { SubSink } from 'subsink';
import { IQueue } from '../ngrx/queues.models';
import { getQueue } from '../ngrx/queues.selectors';

@Component({
  selector: 'app-queue-details',
  templateUrl: './queue-details.component.html',
  styleUrls: ['./queue-details.component.scss']
})
export class QueueDetailsComponent implements OnInit, OnDestroy {
  private subSink = new SubSink();
  queue: IQueue;
  form: FormGroup;

  constructor(
    private activeRoute: ActivatedRoute,
    private store: Store<State>,
    private formBuilder: FormBuilder
    ) { 
      this.form = this.formBuilder.group({
        name: new FormControl({value: '', disabled: true}),
        lockDuration: new FormControl({value: '', disabled: true}),
        maxSizeInMegabytes: new FormControl({value: 0, disabled: true}),
        requiresDuplicateDetection: new FormControl({value: false, disabled: true}),
        requiresSession: new FormControl({value: false, disabled: true}),
        defaultMessageTimeToLive: new FormControl({value: '', disabled: true}),
        deadLetteringOnMessageExpiration: new FormControl({value: false, disabled: true}),
        duplicateDetectionHistoryTimeWindow: new FormControl({value: '', disabled: true}),
        maxDeliveryCount: new FormControl({value: 1, disabled: true}),
        enableBatchedOperations: new FormControl({value: '', disabled: true}),
        forwardTo: new FormControl({value: '', disabled: true}),
        userMetadata: new FormControl({value: '', disabled: true}),
        autoDeleteOnIdle: new FormControl({value: '', disabled: true}),
        enablePartitioning: new FormControl({value: false, disabled: true}),
        forwardDeadLetteredMessagesTo: new FormControl({value: '', disabled: true}),
        enableExpress: new FormControl({value: '', disabled: true}),
      });
    }

  ngOnInit(): void {
    this.subSink.add(this.activeRoute.params.subscribe(params => {
      this.store.select(getQueue(params.connectionId, params.queueName))
      .pipe(first())
      .subscribe(q => {
        this.queue = q;
        this.form.setValue({
          name: q.name ?? '',
          lockDuration: q.properties.lockDuration ?? '',
          maxSizeInMegabytes: q.properties.maxSizeInMegabytes ?? 0,
          requiresDuplicateDetection: q.properties.requiresDuplicateDetection ?? false,
          requiresSession: q.properties.requiresSession ?? false,
          defaultMessageTimeToLive: q.properties.defaultMessageTimeToLive ?? '',
          deadLetteringOnMessageExpiration: q.properties.deadLetteringOnMessageExpiration ?? false,
          duplicateDetectionHistoryTimeWindow: q.properties.duplicateDetectionHistoryTimeWindow ?? '',
          maxDeliveryCount: q.properties.maxDeliveryCount ?? 0,
          enableBatchedOperations: q.properties.enableBatchedOperations ?? false,
          forwardTo: q.properties.forwardTo ?? '',
          userMetadata: q.properties.userMetadata ?? '',
          autoDeleteOnIdle: q.properties.autoDeleteOnIdle ?? false,
          enablePartitioning: q.properties.enablePartitioning ?? false,
          forwardDeadLetteredMessagesTo: q.properties.forwardDeadLetteredMessagesTo ?? '',
          enableExpress: q.properties.enableExpress ?? false,
        });
      })
    }));
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
