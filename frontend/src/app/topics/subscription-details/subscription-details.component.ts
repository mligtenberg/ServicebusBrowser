import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { IFormBuilder, IFormGroup } from '@rxweb/types';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { State } from 'src/app/ngrx.module';
import { ISubscriptionDetailsForm } from '../models/ISubscriptionDetailsForm';
import { updateSubscription } from '../ngrx/topics.actions';
import { ISubscription } from '../ngrx/topics.models';
import { getTopicSubscription } from '../ngrx/topics.selectors';

@Component({
  selector: 'app-subscription-details',
  templateUrl: './subscription-details.component.html',
  styleUrls: ['./subscription-details.component.scss']
})
export class SubscriptionDetailsComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  subscription: ISubscription;
  form: IFormGroup<ISubscriptionDetailsForm>;
  formBuilder: IFormBuilder;

  private connectionId: string;
  private topicName: string;

  constructor(
    private activeRoute: ActivatedRoute,
    private store: Store<State>,
    formBuilder: UntypedFormBuilder
    ) {
      this.formBuilder = formBuilder;
      this.form = this.formBuilder.group<ISubscriptionDetailsForm>({
        name: new UntypedFormControl({value: '', disabled: true}),
        lockDuration: new UntypedFormControl({value: ''}),
        requiresSession: new UntypedFormControl({value: false, disabled: true}),
        defaultMessageTimeToLive: new UntypedFormControl({value: ''}),
        deadLetteringOnMessageExpiration: new UntypedFormControl({value: false}),
        maxDeliveryCount: new UntypedFormControl({value: 1}),
        enableBatchedOperations: new UntypedFormControl({value: false}),
        forwardTo: new UntypedFormControl({value: ''}),
        userMetadata: new UntypedFormControl({value: ''}),
        autoDeleteOnIdle: new UntypedFormControl({value: ''}),
        forwardDeadLetteredMessagesTo: new UntypedFormControl({value: ''}),
        deadLetteringOnFilterEvaluationExceptions: new UntypedFormControl({value: false})
      });
    }

  ngOnInit(): void {
    this.subs.add(this.activeRoute.params.subscribe(params => {
      this.store.select(getTopicSubscription(params.connectionId, params.topicName, params.subscriptionName))
      .pipe(first())
      .subscribe(s => {
        this.connectionId = params.connectionId;
        this.topicName = params.topicName;
        this.subscription = s;

        this.form.setValue({
          name: s.name ?? '',
          lockDuration: s.properties.lockDuration ?? '',
          requiresSession: s.properties.requiresSession ?? false,
          defaultMessageTimeToLive: s.properties.defaultMessageTimeToLive ?? '',
          deadLetteringOnMessageExpiration: s.properties.deadLetteringOnMessageExpiration ?? false,
          maxDeliveryCount: s.properties.maxDeliveryCount ?? 0,
          enableBatchedOperations: s.properties.enableBatchedOperations ?? false,
          forwardTo: s.properties.forwardTo ?? '',
          userMetadata: s.properties.userMetadata ?? '',
          autoDeleteOnIdle: s.properties.autoDeleteOnIdle ?? '',
          forwardDeadLetteredMessagesTo: s.properties.forwardDeadLetteredMessagesTo ?? '',
          deadLetteringOnFilterEvaluationExceptions: s.properties.deadLetteringOnFilterEvaluationExceptions,
        });
      });
    }));
  }

  save(): void {
    const formValue = this.form.value;
    this.store.dispatch(updateSubscription({
      connectionId: this.connectionId,
      topicName: this.topicName,
      subscription: {
        name: this.subscription.name,
        info: this.subscription.info,
        properties: {
          autoDeleteOnIdle: formValue.autoDeleteOnIdle,
          deadLetteringOnFilterEvaluationExceptions: formValue.deadLetteringOnFilterEvaluationExceptions,
          deadLetteringOnMessageExpiration: formValue.deadLetteringOnMessageExpiration,
          defaultMessageTimeToLive: formValue.defaultMessageTimeToLive,
          enableBatchedOperations: formValue.enableBatchedOperations,
          lockDuration: formValue.lockDuration,
          maxDeliveryCount: formValue.maxDeliveryCount,
          requiresSession: formValue.requiresSession,
          forwardDeadLetteredMessagesTo: formValue.forwardDeadLetteredMessagesTo,
          forwardTo: formValue.forwardTo,
          userMetadata: formValue.userMetadata
        },
        rules: []
      }
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
