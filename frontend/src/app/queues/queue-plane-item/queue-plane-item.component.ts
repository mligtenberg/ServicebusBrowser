import { Component, ComponentRef, Input, OnDestroy, TemplateRef, ViewChild, ɵComponentType } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { GetMesagesDialogComponent } from 'src/app/messages/get-mesages-dialog/get-mesages-dialog.component';
import { getQueueMessages } from 'src/app/messages/ngrx/messages.actions';
import { State } from 'src/app/ngrx.module';
import { ContextmenuService } from 'src/app/ui/contextmenu.service';
import { DialogService } from 'src/app/ui/dialog.service';
import { DialogOptions } from 'src/app/ui/dialogOptions';
import { DialogRef } from 'src/app/ui/dialogRef';
import { IQueue } from '../ngrx/queues.models';

@Component({
  selector: 'app-queue-plane-item',
  templateUrl: './queue-plane-item.component.html',
  styleUrls: ['./queue-plane-item.component.scss']
})
export class QueuePlaneItemComponent implements OnDestroy {
  @Input()
  queue: IQueue;

  @Input()
  connectionId: string;

  @ViewChild('contextMenu')
  contextMenuReference: TemplateRef<any>

  @ViewChild('dialog')
  dialogReference: TemplateRef<any>

  dialogRef: DialogRef<unknown>;
  subscription: Subscription;

  constructor(
    private store: Store<State>,
    private contextMenu: ContextmenuService,
    private dialog: DialogService
  ) {}

  openContextMenu($event: MouseEvent): void {
    this.contextMenu.openContextmenu({
      templateRef: this.contextMenuReference, 
      mousePosition: {
        y: $event.clientY,
        x: $event.clientX
      },
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

    this.subscription = this.dialogRef.afterClosed().subscribe((messages: number) => {
      this.getMessages(deadletter, messages);
      this.unsubscribe();
    });
  }

  private unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  private getMessages(deadletter: boolean, amountOfMessages: number) {
    this.store.dispatch(getQueueMessages({connectionId: this.connectionId, queueName: this.queue.name, numberOfMessages: amountOfMessages, deadletter}));
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
