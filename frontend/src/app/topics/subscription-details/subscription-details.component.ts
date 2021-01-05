import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { State } from 'src/app/ngrx.module';
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
  form: FormGroup;

  constructor(
    private activeRoute: ActivatedRoute,
    private store: Store<State>,
    private formBuilder: FormBuilder
    ) { 
      this.form = this.formBuilder.group({
        name: new FormControl({value: '', disabled: true}),
        lockDuration: new FormControl({value: '', disabled: true}),
        requiresSession: new FormControl({value: false, disabled: true}),
        defaultMessageTimeToLive: new FormControl({value: '', disabled: true}),
        deadLetteringOnMessageExpiration: new FormControl({value: false, disabled: true}),
        maxDeliveryCount: new FormControl({value: 1, disabled: true}),
        enableBatchedOperations: new FormControl({value: '', disabled: true}),
        forwardTo: new FormControl({value: '', disabled: true}),
        userMetadata: new FormControl({value: '', disabled: true}),
        autoDeleteOnIdle: new FormControl({value: '', disabled: true}),
        forwardDeadLetteredMessagesTo: new FormControl({value: '', disabled: true}),
        deadLetteringOnFilterEvaluationExceptions: new FormControl({value: '', disabled: true})
      });
    }

  ngOnInit(): void {
    this.subs.add(this.activeRoute.params.subscribe(params => {
      this.store.select(getTopicSubscription(params.connectionId, params.topicName, params.subscriptionName))
      .pipe(first())
      .subscribe(s => {
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
          autoDeleteOnIdle: s.properties.autoDeleteOnIdle ?? false,
          forwardDeadLetteredMessagesTo: s.properties.forwardDeadLetteredMessagesTo ?? '',
          deadLetteringOnFilterEvaluationExceptions: s.properties.deadLetteringOnFilterEvaluationExceptions,
        });
      })
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
