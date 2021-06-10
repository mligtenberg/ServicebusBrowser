import { Component, OnDestroy, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { State } from 'src/app/ngrx.module';
import { IMessage, IMessageSet } from '../ngrx/messages.models';
import { getMessages } from '../ngrx/messages.selectors';

@Component({
  selector: 'app-view-messages',
  templateUrl: './view-messages.component.html',
  styleUrls: ['./view-messages.component.scss']
})
export class ViewMessagesComponent implements OnInit, OnDestroy {
  messageSet: IMessageSet;
  selectedMessage: IMessage;
  selectedMessageBody: string;
  editorOptions = {
    theme: 'vs-light',
    readOnly: true,
    language: 'text/plain',
    minimap: {
      enabled: false
    }
   };

  private subs = new Subscription();
  private activePageSubscription: Subscription;

  constructor(
    private store: Store<State>,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subs.add(this.activeRoute.params.subscribe(params => {
      if (this.activePageSubscription) {
        this.activePageSubscription.unsubscribe();
      }

      this.activePageSubscription = this.store.select(getMessages(params.messageSetId))
        .subscribe(messageSet => {
        if (!messageSet) {
          this.router.navigateByUrl('/');
        }

        this.messageSet = messageSet;
        this.selectedMessage = null;
      });
    }));
  }

  selectMessage(message: IMessage): void {
    this.selectedMessage = message;
    this.selectedMessageBody = message.body;
    this.editorOptions = { ...this.editorOptions, language: this.mapContentTypes(message.properties.contentType)};
  }

  private mapContentTypes(contentType: string): string {
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
