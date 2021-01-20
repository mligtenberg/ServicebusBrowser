import { Component, OnInit } from '@angular/core';

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

  constructor() { }

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
    
  }
}
