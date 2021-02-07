import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { generateUuid } from '@azure/core-http';
import { Store } from '@ngrx/store';
import { State } from 'src/app/ngrx.module';
import { DialogService } from 'src/app/ui/dialog.service';
import { ISelectedMessagesTarget } from '../models/ISelectedMessagesTarget';
import { sendMessages } from '../ngrx/messages.actions';
import { IMessage } from '../ngrx/messages.models';
import { SelectMessageTargetDialogComponent } from '../select-message-target-dialog/select-message-target-dialog.component';

@Component({
  selector: 'app-queue-message',
  templateUrl: './queue-message.component.html',
  styleUrls: ['./queue-message.component.scss']
})
export class QueueMessageComponent {
  editorOptions = { theme: 'vs-light', language: 'text/plain' };

  form: FormGroup;

  constructor(
    private store: Store<State>,
    private dialogService: DialogService,
    formBuilder: FormBuilder
  ) { 
    this.form = formBuilder.group({
      body: "",
      subject: "",
      contentType: "",
      customProperties: formBuilder.array([])
    });

    this.form.get("contentType").valueChanges.subscribe((v) => this.contentTypeUpdated(v));
  }

  getNewCustomProperty() {
    return {
      name: '',
      type: '',
      value: ''
    }
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

  send() {
    const formValue = this.form.value;

    const operationId = generateUuid();
    const message =           {
      id: operationId,
      body: formValue.body,
      customProperties: new Map<string, string>(),
      properties: new Map<string, string>(),
      subject: formValue.subject
    } as IMessage;

    message.properties.set("conentType", formValue.contentType)

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
