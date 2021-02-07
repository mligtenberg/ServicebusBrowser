import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { generateUuid } from '@azure/core-http';
import { Store } from '@ngrx/store';
import { State } from 'src/app/ngrx.module';
import { DialogService } from 'src/app/ui/dialog.service';
import { ISelectedMessagesTarget } from '../models/ISelectedMessagesTarget';
import { sendMessages } from '../ngrx/messages.actions';
import { IMessage } from '../ngrx/messages.models';
import { SelectMessageTargetDialogComponent } from '../select-message-target-dialog/select-message-target-dialog.component';
import { IFormBuilder, IFormGroup, IFormArray} from "@rxweb/types"
import { IQueueMessageCustomPropertyForm, IQueueMessageForm } from '../models/IQueueMessageForm';
import * as moment from "moment";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-queue-message',
  templateUrl: './queue-message.component.html',
  styleUrls: ['./queue-message.component.scss']
})
export class QueueMessageComponent implements OnInit, OnDestroy {
  editorOptions = { theme: 'vs-light', language: 'text/plain' };
  formBuilder: IFormBuilder;

  form: IFormGroup<IQueueMessageForm>;
  subs = new Subscription();

  get customProperties(): IFormArray<IQueueMessageCustomPropertyForm> {
    return this.form.controls.customProperties as IFormArray<IQueueMessageCustomPropertyForm>;
  }

  constructor(
    private store: Store<State>,
    private dialogService: DialogService,
    formBuilder: FormBuilder
  ) { 
    this.formBuilder = formBuilder;

    this.form = this.formBuilder.group<IQueueMessageForm>({
      body: "",
      subject: "",
      contentType: "",
      customProperties: this.formBuilder.array<IQueueMessageCustomPropertyForm>([])
    });
  }

  ngOnInit() {
    this.subs.add(this.form.get("contentType").valueChanges.subscribe((v) => this.contentTypeUpdated(v as any as string)));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getNewCustomPropertyForm(): IFormGroup<IQueueMessageCustomPropertyForm> {
    return this.formBuilder.group<IQueueMessageCustomPropertyForm>({
      key: '',
      type: 'string',
      value: ''
    });
  }

  contentTypeUpdated(newValue: string) {
    this.editorOptions = {...this.editorOptions, language: this.mapContentTypes(newValue)}
  }

  private mapContentTypes(contentType: string) {
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

  addCustomProperty() {
    const array = this.customProperties;
    array.push(this.getNewCustomPropertyForm());
  }

  send() {
    const formValue = this.form.value;

    const operationId = generateUuid();
    const message = {
      id: operationId,
      body: formValue.body,
      properties: {
        subject: formValue.subject,
        contentType: formValue.contentType
      },
      customProperties: new Map<string, string | boolean | number | Date>()
    } as IMessage;

    for (const propForms of this.customProperties.controls) {
      const key = propForms.value.key;
      let value = null;
      switch (propForms.value.type) {
        case "string":
          value = propForms.value.value;
          break;
        case "boolean":
          value = propForms.value.value.toLowerCase() === "true";
          break;
        case "number":
          value = parseFloat(propForms.value.value);
          break;
        case "date":
          value = moment(propForms.value.value);    
          break;      
      }

      message.customProperties.set(key, value);
    }

    const dialog = this.dialogService.openDialog<SelectMessageTargetDialogComponent, ISelectedMessagesTarget>(SelectMessageTargetDialogComponent);
    const sub = dialog.afterClosed().subscribe(target => {
      this.store.dispatch(sendMessages({
        connectionId: target.connectionId,
        operationId: operationId,
        queueOrTopicName: target.queueOrTopicName,
        messages: [
          message
        ]
      }));
      sub.unsubscribe();
    })
  }
}
