import { TemplateRef, ViewChild, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { GetMesagesDialogComponent } from 'src/app/messages/get-mesages-dialog/get-mesages-dialog.component';
import { getSubscriptionMessages } from 'src/app/messages/ngrx/messages.actions';
import { State } from 'src/app/ngrx.module';
import { ContextmenuService } from 'src/app/ui/contextmenu.service';
import { DialogService } from 'src/app/ui/dialog.service';
import { DialogRef } from 'src/app/ui/dialogRef';
import { MessagesChannel } from '../../../../../ipcModels';
import { ISubscription } from '../ngrx/topics.models';

@Component({
  selector: 'app-topic-plane-subscription',
  templateUrl: './topic-plane-subscription.component.html',
  styleUrls: ['./topic-plane-subscription.component.scss']
})
export class TopicPlaneSubscriptionComponent {
  @Input() connectionId: string;
  @Input() topicName: string;
  @Input() subscription: ISubscription;

  @ViewChild('contextMenu')
  contextMenuReference: TemplateRef<any>;

  dialogRef: DialogRef<unknown>;
  dialogSubscription: Subscription;

  constructor(
    private store: Store<State>,
    private dialog: DialogService,
    private contextMenu: ContextmenuService
  ) {}

  openContextMenu($event: MouseEvent): void {
    this.contextMenu.openContextmenu({
      templateRef: this.contextMenuReference, 
      mousePosition: {
        y: $event.clientY,
        x: $event.clientX
      },
      width: 350,
    });
  
    $event.stopPropagation();
  }

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
