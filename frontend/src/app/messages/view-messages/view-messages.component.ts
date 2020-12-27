import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State } from 'src/app/ngrx.module';
import { IMessage, IMessageSet } from '../ngrx/messages.models';
import { getMessages } from '../ngrx/messages.selectors';

@Component({
  selector: 'app-view-messages',
  templateUrl: './view-messages.component.html',
  styleUrls: ['./view-messages.component.scss']
})
export class ViewMessagesComponent implements OnInit {
  messageSet: IMessageSet;
  selectedMessage: IMessage;

  constructor(
    private store: Store<State>
  ) { }

  ngOnInit(): void {
    this.store.select(getMessages).subscribe(messageSet => {
      this.messageSet = messageSet;
    });
  }

  selectMessage(message: IMessage): void {
    this.selectedMessage = message;
  }

}
