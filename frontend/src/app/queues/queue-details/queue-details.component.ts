import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { IFormBuilder, IFormGroup } from '@rxweb/types';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { State } from 'src/app/ngrx.module';
import { IQueueDetailsForm } from '../models/IQueueDetailsForm';
import { updateQueue } from '../ngrx/queues.actions';
import { IQueue } from '../ngrx/queues.models';
import { getQueue } from '../ngrx/queues.selectors';

@Component({
  selector: 'app-queue-details',
  templateUrl: './queue-details.component.html',
  styleUrls: ['./queue-details.component.scss']
})
export class QueueDetailsComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  connectionId: string;
  queue: IQueue;
  form: IFormGroup<IQueueDetailsForm>;
  formBuilder: IFormBuilder;

  constructor(
    private activeRoute: ActivatedRoute,
    private store: Store<State>,
    formBuilder: FormBuilder
    ) { 
      this.formBuilder = formBuilder;
      this.form = this.formBuilder.group<IQueueDetailsForm>({
        name: new FormControl({value: ''}),
        lockDuration: new FormControl({value: ''}),
        maxSizeInMegabytes: new FormControl({value: 0}),
        requiresDuplicateDetection: new FormControl({value: false, disabled: true}),
        requiresSession: new FormControl({value: false, disabled: true}),
        defaultMessageTimeToLive: new FormControl({value: ''}),
        deadLetteringOnMessageExpiration: new FormControl({value: false}),
        duplicateDetectionHistoryTimeWindow: new FormControl({value: ''}),
        maxDeliveryCount: new FormControl({value: 1}),
        enableBatchedOperations: new FormControl({value: ''}),
        forwardTo: new FormControl({value: ''}),
        userMetadata: new FormControl({value: ''}),
        autoDeleteOnIdle: new FormControl({value: '', disabled: true}),
        enablePartitioning: new FormControl({value: false, disabled: true}),
        forwardDeadLetteredMessagesTo: new FormControl({value: ''}),
        enableExpress: new FormControl({value: '', disabled: true}),
      });
    }

  ngOnInit(): void {
    this.subs.add(this.activeRoute.params.subscribe(params => {
      this.connectionId = params.connectionId;
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

  save(): void {
    const formValue = this.form.value;
    
    this.store.dispatch(updateQueue({
      connectionId: this.connectionId,
      queue: {
        name: this.queue.name,
        info: this.queue.info,
        properties: {
          autoDeleteOnIdle: formValue.autoDeleteOnIdle,
          deadLetteringOnMessageExpiration: formValue.deadLetteringOnMessageExpiration,
          defaultMessageTimeToLive: formValue.defaultMessageTimeToLive,
          duplicateDetectionHistoryTimeWindow: formValue.duplicateDetectionHistoryTimeWindow,
          enableBatchedOperations: formValue.enableBatchedOperations,
          enableExpress: formValue.enableExpress,
          enablePartitioning: formValue.enablePartitioning,
          lockDuration: formValue.lockDuration,
          maxDeliveryCount: formValue.maxDeliveryCount,
          maxSizeInMegabytes: formValue.maxSizeInMegabytes,
          requiresDuplicateDetection: formValue.requiresDuplicateDetection,
          requiresSession: formValue.requiresSession,
          userMetadata: formValue.userMetadata,
          forwardDeadLetteredMessagesTo: formValue.forwardDeadLetteredMessagesTo,
          forwardTo: formValue.forwardTo
        }
      }
    }))
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
