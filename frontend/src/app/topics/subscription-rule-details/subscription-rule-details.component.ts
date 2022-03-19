import { Component, OnInit } from '@angular/core';
import { getSubscriptionRule } from '../ngrx/topics.selectors';
import { first } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { State } from '../../ngrx.module';
import { FormBuilder, FormControl } from '@angular/forms';
import { ISubscriptionDetailsForm } from '../models/ISubscriptionDetailsForm';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-subscription-rule-details',
    templateUrl: './subscription-rule-details.component.html',
    styleUrls: ['./subscription-rule-details.component.scss'],
})
export class SubscriptionRuleDetailsComponent implements OnInit {
    private subs = new Subscription();

    constructor(private activeRoute: ActivatedRoute, private store: Store<State>, formBuilder: FormBuilder) {}

    ngOnInit(): void {
        this.subs.add(
            this.activeRoute.params.subscribe((params) => {
                this.store
                    .select(getSubscriptionRule(params.connectionId, params.topicName, params.subscriptionName, params.ruleName))
                    .pipe(first())
                    .subscribe((subscriptionRule) => {
                        console.log(subscriptionRule);
                    });
            })
        );
    }
}
