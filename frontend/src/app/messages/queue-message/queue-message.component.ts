import { Component, OnInit } from '@angular/core';
import { generateUuid } from '@azure/core-http';
import { Store } from '@ngrx/store';
import { State } from 'src/app/ngrx.module';
import { DialogService } from 'src/app/ui/dialog.service';
import { ISelectedMessagesTarget } from '../models/ISelectedMessagesTarget';
import { sendMessages } from '../ngrx/messages.actions';
import { SelectMessageTargetDialogComponent } from '../select-message-target-dialog/select-message-target-dialog.component';

@Component({
  selector: 'app-queue-message',
  templateUrl: './queue-message.component.html',
  styleUrls: ['./queue-message.component.scss']
})
export class QueueMessageComponent {
  label: string = '';
  body: string = '';
  contentType: string = '';

  editorOptions = { theme: 'vs-light', language: 'text/plain' };

  constructor(
    private store: Store<State>,
    private dialogService: DialogService
  ) { }

  contentTypeUpdated() {
    this.editorOptions = {...this.editorOptions, language: this.mapContentTypes(this.contentType)}
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
    const operationId = generateUuid();
    const dialog = this.dialogService.openDialog<SelectMessageTargetDialogComponent, ISelectedMessagesTarget>(SelectMessageTargetDialogComponent);
    const sub = dialog.afterClosed().subscribe(target => {
      this.store.dispatch(sendMessages({
        connectionId: target.connectionId,
        operationId: operationId,
        queueOrTopicName: target.queueOrTopicName,
        messages: [
          {
            id: operationId,
            body: this.body,
            customProperties: new Map<string, string>(),
            properties: new Map<string, string>(),
            subject: this.label
          }
        ]
      }));
      sub.unsubscribe();
    })
  }
}
