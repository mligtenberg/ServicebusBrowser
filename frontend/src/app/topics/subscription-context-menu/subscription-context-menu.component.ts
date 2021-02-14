import { Component, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { GetMesagesDialogComponent } from 'src/app/messages/get-mesages-dialog/get-mesages-dialog.component';
import { clearSubscriptionMessages, getSubscriptionMessages } from 'src/app/messages/ngrx/messages.actions';
import { MessagesChannel } from 'src/app/messages/ngrx/messages.models';
import { State } from 'src/app/ngrx.module';
import { ContextmenuService } from 'src/app/ui/contextmenu.service';
import { DialogService } from 'src/app/ui/dialog.service';
import { DialogRef } from 'src/app/ui/dialog.service';
import { ISubscription } from '../ngrx/topics.models';

@Component({
  selector: 'app-subscription-context-menu',
  templateUrl: './subscription-context-menu.component.html',
  styleUrls: ['./subscription-context-menu.component.scss']
})
export class SubscriptionContextMenuComponent implements OnDestroy {
  @Input() connectionId: string;
  @Input() topicName: string;
  @Input() subscription: ISubscription;

  dialogRef: DialogRef<unknown>;
  dialogSubscription: Subscription;

  constructor(
    private contextMenu: ContextmenuService,
    private store: Store<State>,
    private dialog: DialogService,
  ) { }

  getQueuedMessages($event: Event) {
    this.contextMenu.closeContextmenu();

    this.openDialog();
    this.subscribe(MessagesChannel.regular);

    $event.stopPropagation();
  }
  
  getDeadletters($event: Event) {
    this.contextMenu.closeContextmenu();

    this.openDialog();
    this.subscribe(MessagesChannel.deadletter);

    $event.stopPropagation();
  }

  getTransferredDeadletters($event: Event) {
    this.contextMenu.closeContextmenu();

    this.openDialog();
    this.subscribe(MessagesChannel.transferedDeadletters);

    $event.stopPropagation();
  }

  clearQueuedMessages($event: Event) {
    this.clearMessages($event, MessagesChannel.regular);
  }

  clearDeadletterMessages($event: Event) {
    this.clearMessages($event, MessagesChannel.deadletter);
  }

  clearTransferedDeadletterMessages($event: Event) {
    this.clearMessages($event, MessagesChannel.transferedDeadletters);
  }

  private clearMessages($event: Event, channel: MessagesChannel) {
    this.store.dispatch(clearSubscriptionMessages({connectionId: this.connectionId, topicName: this.topicName, subscriptionName: this.subscription.name, channel}));
    this.contextMenu.closeContextmenu();
    $event.stopPropagation();
  }


  private openDialog() {
    this.dialogRef = this.dialog.openDialog(GetMesagesDialogComponent);
  }

  private subscribe(channel: MessagesChannel) {
    this.unsubscribe();

    this.dialogSubscription = this.dialogRef.afterClosed().subscribe((messages: number) => {
      this.getMessages(channel, messages);
      this.unsubscribe();
    });
  }

  private unsubscribe() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
      this.dialogSubscription = null;
    }
  }

  private getMessages(channel: MessagesChannel, amountOfMessages: number) {
    this.store.dispatch(getSubscriptionMessages({
      connectionId: this.connectionId,
       topicName: this.topicName,
       subscriptionName: this.subscription.name,
       numberOfMessages: amountOfMessages,
       channel}));
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
