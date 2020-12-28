import { TemplateRef, ViewChild, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { GetMesagesDialogComponent } from 'src/app/messages/get-mesages-dialog/get-mesages-dialog.component';
import { getSubscriptionMessages } from 'src/app/messages/ngrx/messages.actions';
import { State } from 'src/app/ngrx.module';
import { ContextmenuService } from 'src/app/ui/contextmenu.service';
import { DialogService } from 'src/app/ui/dialog.service';
import { DialogRef } from 'src/app/ui/dialogRef';
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

  openContextMenu($event: Event): void {
    this.contextMenu.openContextmenu({
      templateRef: this.contextMenuReference, 
      target: $event.target as HTMLElement,
      width: 300,
    });
  
    $event.stopPropagation();
  }

  getQueuedMessages($event: Event) {
    this.contextMenu.closeContextmenu();

    this.openDialog();
    this.subscribe(false);

    $event.stopPropagation();
  }
  
  getDeadletters($event: Event) {
    this.contextMenu.closeContextmenu();

    this.openDialog();
    this.subscribe(true);

    $event.stopPropagation();
  }

  private openDialog() {
    this.dialogRef = this.dialog.openDialog(GetMesagesDialogComponent);
  }

  private subscribe(deadletter: boolean) {
    this.unsubscribe();

    this.dialogSubscription = this.dialogRef.afterClosed().subscribe((messages: number) => {
      this.getMessages(deadletter, messages);
      this.unsubscribe();
    });
  }

  private unsubscribe() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
      this.dialogSubscription = null;
    }
  }

  private getMessages(deadletter: boolean, amountOfMessages: number) {
    this.store.dispatch(getSubscriptionMessages({
      connectionId: this.connectionId,
       topicName: this.topicName,
       subscriptionName: this.subscription.name,
       numberOfMessages: amountOfMessages,
       deadletter}));
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
