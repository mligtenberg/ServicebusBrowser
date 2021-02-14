import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { GetMesagesDialogComponent } from 'src/app/messages/get-mesages-dialog/get-mesages-dialog.component';
import { clearQueueMessages, getQueueMessages } from 'src/app/messages/ngrx/messages.actions';
import { MessagesChannel } from 'src/app/messages/ngrx/messages.models';
import { State } from 'src/app/ngrx.module';
import { ContextmenuService } from 'src/app/ui/contextmenu.service';
import { DialogService } from 'src/app/ui/dialog.service';
import { DialogRef } from 'src/app/ui/dialog.service';
import { IQueue } from '../ngrx/queues.models';

@Component({
  selector: 'app-queue-context-menu',
  templateUrl: './queue-context-menu.component.html',
  styleUrls: ['./queue-context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueueContextMenuComponent implements OnDestroy {
  @Input()
  queue: IQueue;

  @Input()
  connectionId: string;
  
  dialogRef: DialogRef<unknown>;
  subscription: Subscription;

  constructor(
    private store: Store<State>,
    private contextMenu: ContextmenuService,
    private dialog: DialogService
  ) {}

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
    this.store.dispatch(clearQueueMessages({connectionId: this.connectionId, queueName: this.queue.name, channel}));
    this.contextMenu.closeContextmenu();
    $event.stopPropagation();
  }

  private openDialog() {
    this.dialogRef = this.dialog.openDialog(GetMesagesDialogComponent);
  }

  private subscribe(channel: MessagesChannel) {
    this.unsubscribe();

    this.subscription = this.dialogRef.afterClosed().subscribe((messages: number) => {
      this.getMessages(channel, messages);
      this.unsubscribe();
    });
  }

  private unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  private getMessages(channel: MessagesChannel, amountOfMessages: number) {
    this.store.dispatch(getQueueMessages({connectionId: this.connectionId, queueName: this.queue.name, numberOfMessages: amountOfMessages, channel}));
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
