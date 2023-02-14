import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { State } from 'src/app/ngrx.module';
import { DialogService } from 'src/app/ui/dialog.service';
import { ISelectedMessagesTarget } from '../../models/ISelectedMessagesTarget';
import { sendMessages } from '../../ngrx/messages.actions';
import { IMessage, IMessageSet } from '../../ngrx/messages.models';
import { SelectMessageTargetDialogComponent } from '../../select-message-target-dialog/select-message-target-dialog.component';
import { IFormBuilder, IFormGroup, IFormArray } from '@rxweb/types';
import { IQueueMessageCustomPropertyForm, IQueueMessageForm } from '../../models/IQueueMessageForm';
import * as moment from 'moment';
import { Observable, of, Subscription, switchMap, take } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ActivatedRoute } from '@angular/router';
import { getMessage, getMessages } from '../../ngrx/messages.selectors';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-queue-message',
    templateUrl: './queue-message.component.html',
    styleUrls: ['./queue-message.component.scss'],
})
export class QueueMessageComponent implements OnInit, OnDestroy {
    editorOptions = { theme: 'vs-light', language: 'text/plain' };
    formBuilder: IFormBuilder;

    form: IFormGroup<IQueueMessageForm>;
    subs = new Subscription();

    selectedMessagesTarget?: ISelectedMessagesTarget;

    get customProperties(): IFormArray<IQueueMessageCustomPropertyForm> {
        return this.form.controls.customProperties as IFormArray<IQueueMessageCustomPropertyForm>;
    }

    constructor(
        private store: Store<State>,
        private dialogService: DialogService,
        formBuilder: UntypedFormBuilder,
        private activatedRoute: ActivatedRoute
    ) {
        this.formBuilder = formBuilder;

        this.form = this.formBuilder.group<IQueueMessageForm>({
            body: '',
            subject: '',
            contentType: '',
            customProperties: this.formBuilder.array<IQueueMessageCustomPropertyForm>([]),
        });
    }

    private static mapContentTypes(contentType: string): string {
        contentType = contentType.toLocaleLowerCase();
        if (contentType.indexOf('xml') >= 0) {
            return 'xml';
        }
        if (contentType.indexOf('json') >= 0) {
            return 'json';
        }
        if (contentType.indexOf('yaml') >= 0 || contentType.indexOf('yml') >= 0) {
            return 'yaml';
        }
        return 'text/plain';
    }

    ngOnInit(): void {
        this.subs.add(this.form.get('contentType').valueChanges.subscribe((v) => this.contentTypeUpdated(v as any as string)));

        const sub = this.activatedRoute.params
            .pipe(
                switchMap((params) => {
                    if (!params.messageSetId || !params.messageId) {
                        return undefined;
                    }

                    return this.store.select(getMessages(params.messageSetId)).pipe(
                        map((messageSet) => {
                            const currentMessage = messageSet?.messages.find((m) => m.id === params.messageId);
                            return [messageSet, currentMessage];
                        })
                    );
                })
            )
            .subscribe(([messageSet, message]: [IMessageSet, IMessage]) => {
                this.customProperties.clear();

                const customPropertyKeys = message?.customProperties?.keys() ?? [];
                for (const key of customPropertyKeys) {
                    const value = message?.customProperties.get(key);
                    const type = typeof value;

                    this.customProperties.push(
                        this.getNewCustomPropertyForm(key, type as any as 'string' | 'number' | 'boolean' | 'date', value.toString())
                    );
                }

                this.selectedMessagesTarget = !messageSet
                    ? undefined
                    : {
                          connectionId: messageSet.connectionId ?? '',
                          queueOrTopicName: messageSet.topicName ?? messageSet.queueName ?? '',
                      };

                this.form.patchValue({
                    body: message?.body ?? '',
                    subject: message?.properties.subject ?? '',
                    contentType: message?.properties.contentType ?? '',
                });
            });

        this.subs.add(sub);
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    getNewCustomPropertyForm(
        key = '',
        type: 'string' | 'number' | 'boolean' | 'date' = 'string',
        value = ''
    ): IFormGroup<IQueueMessageCustomPropertyForm> {
        return this.formBuilder.group<IQueueMessageCustomPropertyForm>({
            key: key,
            type: type,
            value: value,
        });
    }

    contentTypeUpdated(newValue: string): void {
        this.editorOptions = { ...this.editorOptions, language: QueueMessageComponent.mapContentTypes(newValue) };
    }

    addCustomProperty(): void {
        const array = this.customProperties;
        array.push(this.getNewCustomPropertyForm());
    }

    removeCustomProperty(index: number): void {
        const array = this.customProperties;
        array.removeAt(index);
    }

    selectQueueOrTopic(): void {
        this.openSelectDialog()
            .pipe(take(1))
            .subscribe((target) => {
                this.selectedMessagesTarget = target;
            });
    }

    openSelectDialog(): Observable<ISelectedMessagesTarget> {
        const dialog = this.dialogService.openDialog<SelectMessageTargetDialogComponent, ISelectedMessagesTarget>(
            SelectMessageTargetDialogComponent
        );

        return dialog.afterClosed();
    }

    send(): void {
        const formValue = this.form.value;

        const operationId = uuidv4();
        const message = {
            id: operationId,
            body: formValue.body,
            properties: {
                subject: formValue.subject,
                contentType: formValue.contentType,
            },
            customProperties: new Map<string, string | boolean | number | Date>(),
        } as IMessage;

        for (const propForms of this.customProperties.controls) {
            const key = propForms.value.key;
            let value = null;
            switch (propForms.value.type) {
                case 'string':
                    value = propForms.value.value;
                    break;
                case 'boolean':
                    value = propForms.value.value.toLowerCase() === 'true';
                    break;
                case 'number':
                    value = parseFloat(propForms.value.value);
                    break;
                case 'date':
                    value = moment(propForms.value.value);
                    break;
            }

            message.customProperties.set(key, value);
        }

        const observable = this.selectedMessagesTarget ? of(this.selectedMessagesTarget) : this.openSelectDialog();

        observable.pipe(take(1)).subscribe((target) => {
            this.store.dispatch(
                sendMessages({
                    connectionId: target.connectionId,
                    operationId,
                    queueOrTopicName: target.queueOrTopicName,
                    messages: [message],
                })
            );
        });
    }
}
