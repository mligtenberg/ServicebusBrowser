import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  private subs = new Subscription();

  constructor(
    private store: Store<State>,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subs.add(this.store.select(getMessages).subscribe(messageSet => {
      if (!messageSet) {
        this.router.navigateByUrl("/");
      }

      this.messageSet = messageSet;
      this.selectedMessage = null;
    }));
  }

  selectMessage(message: IMessage): void {
    this.selectedMessage = message;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
