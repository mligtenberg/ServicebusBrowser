import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubscriptionRuleForm } from './form';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { ButtonDirective } from 'primeng/button';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { UUID } from '@service-bus-browser/shared-contracts';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  TopologyActions,
  TopologySelectors,
} from '@service-bus-browser/topology-store';
import { SubscriptionRule, systemPropertyKeys } from '@service-bus-browser/topology-contracts';

@Component({
  selector: 'lib-subscription-rule-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Card,
    InputText,
    RadioButton,
    EditorComponent,
    ButtonDirective,
  ],
  templateUrl: './subscription-rule-management.component.html',
  styleUrl: './subscription-rule-management.component.scss',
})
export class SubscriptionRuleManagementComponent implements OnDestroy {
  activeRoute = inject(ActivatedRoute);
  store = inject(Store);
  form = this.createForm();
  filterEditorOptions = {
    theme: 'vs-light',
    readOnly: false,
    language: 'text/plain',
    minimap: {
      enabled: false,
    },
  };

  actionEditorOptions = {
    theme: 'vs-light',
    readOnly: false,
    language: 'text/plain',
    minimap: {
      enabled: false,
    },
  };

  destroy$ = new Subject<void>();
  newParams$ = new Subject<void>();
  action: 'create' | 'modify' = 'create';

  constructor() {
    combineLatest([this.activeRoute.params, this.activeRoute.data])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([ params, data ]) => {
        this.action = data['action'] as 'create' | 'modify';
        this.form = this.createForm();

        const namespaceId = params['namespaceId'] as UUID | undefined;
        const topicId = params['topicId'] as string | undefined;
        const subscriptionId = params['subscriptionId'] as string | undefined;
        const ruleName = params['ruleName'] as string | undefined;

        if (namespaceId === undefined) {
          throw new Error('Namespace ID is required');
        }

        if (topicId === undefined) {
          throw new Error('Topic ID is required');
        }

        if (subscriptionId === undefined) {
          throw new Error('Subscription ID is required');
        }

        if (this.action === 'create') {
          this.configureFormAsCreate();
          return;
        }

        this.newParams$.next();
        this.newParams$.complete();
        this.newParams$ = new Subject<void>();

        if (!ruleName) {
          throw new Error('Rule Name is required for modify action');
        }

        this.configureFormAsEdit();

        this.store
          .select(
            TopologySelectors.selectSubscriptionRuleById(
              namespaceId,
              topicId,
              subscriptionId,
              ruleName
            )
          )
          .pipe(takeUntil(this.newParams$), takeUntil(this.destroy$))
          .subscribe((rule) => {
            if (!rule) {
              return;
            }

            if (rule.filterType === 'sql') {
              this.form.patchValue(
                {
                  name: rule.name,
                  type: 'sql',
                  sqlFilter: rule.filter,
                  sqlAction: rule.action,
                },
                { emitEvent: false }
              );
            }
            if (rule.filterType === 'correlation') {
              this.form.patchValue(
                {
                  name: rule.name,
                  type: 'correlation',
                  correlationSystemProperties: rule.systemProperties,
                  correlationApplicationProperties: rule.applicationProperties,
                },
                { emitEvent: false }
              );
            }
          });
      });
  }

  save() {
    if (this.form.invalid) {
      console.log('Form is invalid');
      return;
    }

    const formValue = this.form.getRawValue();
    const subscriptionRule: SubscriptionRule = formValue.type === 'sql'
      ? {
        filterType: 'sql',
        filter: formValue.sqlFilter ?? '1=1',
        action: formValue.sqlAction ?? '',
        name: formValue.name ?? 'error',
        subscriptionId: this.activeRoute.snapshot.params['subscriptionId'],
        topicId: this.activeRoute.snapshot.params['topicId'],
        namespaceId: this.activeRoute.snapshot.params['namespaceId'],
        }
      : {
        filterType: 'correlation',
        subscriptionId: this.activeRoute.snapshot.params['subscriptionId'],
        topicId: this.activeRoute.snapshot.params['topicId'],
        namespaceId: this.activeRoute.snapshot.params['namespaceId'],
        action: formValue.sqlAction ?? '',
        name: formValue.name ?? 'error',
        systemProperties: formValue.correlationSystemProperties.map((sp) => ({
          key: sp.key,
          value: sp.value,
        })),
        applicationProperties: formValue.correlationApplicationProperties.map((ap) => ({
          key: ap.key,
          value: ap.value,
        })),
      };

    // Save the form
    if (this.action === 'create') {
      // Create the rule
      this.store.dispatch(
        TopologyActions.addSubscriptionRule({
          namespaceId: this.activeRoute.snapshot.params['namespaceId'],
          topicId: this.activeRoute.snapshot.params['topicId'],
          subscriptionId: this.activeRoute.snapshot.params['subscriptionId'],
          rule: subscriptionRule,
        })
      );
      return;
    }

    this.store.dispatch(
      TopologyActions.editSubscriptionRule({
        namespaceId: this.activeRoute.snapshot.params['namespaceId'],
        topicId: this.activeRoute.snapshot.params['topicId'],
        subscriptionId: this.activeRoute.snapshot.params['subscriptionId'],
        rule: subscriptionRule,
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configureFormAsCreate(): void {
    this.form.controls.name.enable();
    this.form.controls.type.enable();
  }

  private configureFormAsEdit(): void {
    this.form.controls.name.disable();
    this.form.controls.type.disable();
  }

  private createForm(): FormGroup<SubscriptionRuleForm> {
    return new FormGroup({
      name: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      type: new FormControl<'sql' | 'correlation'>('sql', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      sqlFilter: new FormControl<string | null>('1=1'),
      sqlAction: new FormControl<string | null>(null),
      correlationSystemProperties: new FormArray<
        FormGroup<{
          key: FormControl<systemPropertyKeys>;
          value: FormControl<string>;
        }>
      >([]),
      correlationApplicationProperties: new FormArray<
        FormGroup<{
          key: FormControl<string>;
          value: FormControl<string | number | Date | boolean>;
        }>
      >([]),
    });
  }
}
