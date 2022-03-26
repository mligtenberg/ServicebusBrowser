import { Component, OnDestroy, OnInit } from '@angular/core';
import { getSubscriptionRule } from '../ngrx/topics.selectors';
import { first, mergeMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { State } from '../../ngrx.module';
import { AbstractControl, Form, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IFormArray, IFormBuilder, IFormGroup } from '@rxweb/types';
import { ISubscriptionRuleApplicationPropertiesForm, ISubscriptionRuleForm } from '../models/ISubscriptionRuleForm';
import { CorrelationRuleFilter, RuleProperties, SqlRuleFilter } from '@azure/service-bus';

@Component({
    selector: 'app-subscription-rule-details',
    templateUrl: './subscription-rule-details.component.html',
    styleUrls: ['./subscription-rule-details.component.scss'],
})
export class SubscriptionRuleDetailsComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    form: IFormGroup<ISubscriptionRuleForm>;
    get correlationApplicationProperties(): IFormArray<ISubscriptionRuleApplicationPropertiesForm> {
        return this.form.get('correlationApplicationProperties') as unknown as IFormArray<ISubscriptionRuleApplicationPropertiesForm>;
    }

    formBuilder: IFormBuilder;
    editorOptions = {
        theme: 'vs-light',
        readOnly: true,
        language: 'text/plain',
        minimap: {
            enabled: false,
        },
    };

    constructor(private activeRoute: ActivatedRoute, private store: Store<State>, formBuilder: FormBuilder) {
        this.formBuilder = formBuilder;
        this.form = this.formBuilder.group<ISubscriptionRuleForm>({
            name: new FormControl({ value: '', disabled: true }),
            type: 'sql',
            sqlFilter: '',
            sqlAction: '',
            correlationFilterContentType: '',
            correlationFilterCorrelationId: '',
            correlationFilterSubject: '',
            correlationFilterMessageId: '',
            correlationFilterReplyTo: '',
            correlationFilterSessionId: '',
            correlationFilterReplyToSessionId: '',
            correlationFilterTo: '',
            correlationApplicationProperties: this.formBuilder.array<ISubscriptionRuleApplicationPropertiesForm>([]),
        });

        this.form.disable();
    }

    ngOnInit(): void {
        const observable = this.activeRoute.params.pipe(
            mergeMap((params) => {
                return this.store
                    .select(getSubscriptionRule(params.connectionId, params.topicName, params.subscriptionName, params.ruleName))
                    .pipe(first());
            })
        );

        this.subscription = observable.subscribe((rule: RuleProperties) => {
            console.log(rule);
            const sqlFilter = rule.filter as SqlRuleFilter;
            const correlationFilter = rule.filter as CorrelationRuleFilter;

            this.form.patchValue({
                name: rule.name,
                type: this.isCorrelationFilter(rule.filter) ? 'correlation' : 'sql',
                sqlFilter: sqlFilter.sqlExpression,
                sqlAction: rule.action.sqlExpression,
                correlationFilterContentType: correlationFilter.contentType,
                correlationFilterReplyToSessionId: correlationFilter.replyToSessionId,
                correlationFilterReplyTo: correlationFilter.replyTo,
                correlationFilterMessageId: correlationFilter.messageId,
                correlationFilterCorrelationId: correlationFilter.correlationId,
                correlationFilterTo: correlationFilter.to,
                correlationFilterSubject: correlationFilter.subject,
                correlationFilterSessionId: correlationFilter.sessionId,
            });

            const appProps = correlationFilter.applicationProperties ?? {};
            this.correlationApplicationProperties.clear();
            for (const key in appProps) {
                if (appProps.hasOwnProperty(key)) {
                    const formGroup = new FormGroup({
                        key: new FormControl(key),
                        value: new FormControl(appProps[key]),
                    });
                    formGroup.disable();
                    this.correlationApplicationProperties.push(formGroup);
                }
            }
        });
    }

    asFormGroup(formObject: AbstractControl): FormGroup {
        return formObject as FormGroup;
    }

    private isCorrelationFilter(filter: SqlRuleFilter | CorrelationRuleFilter): boolean {
        const correlationFilter = filter as CorrelationRuleFilter;
        return (
            correlationFilter.correlationId !== undefined ||
            correlationFilter.messageId !== undefined ||
            correlationFilter.to !== undefined ||
            correlationFilter.replyTo !== undefined ||
            correlationFilter.subject !== undefined ||
            correlationFilter.sessionId !== undefined ||
            correlationFilter.replyToSessionId !== undefined ||
            correlationFilter.contentType !== undefined ||
            correlationFilter.applicationProperties !== undefined
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
