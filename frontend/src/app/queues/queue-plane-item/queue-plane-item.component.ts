import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { getQueueMessages } from 'src/app/messages/ngrx/messages.actions';
import { State } from 'src/app/ngrx.module';
import { ContextmenuService } from 'src/app/ui/contextmenu.service';
import { IQueue } from '../ngrx/queues.models';

@Component({
  selector: 'app-queue-plane-item',
  templateUrl: './queue-plane-item.component.html',
  styleUrls: ['./queue-plane-item.component.scss']
})
export class QueuePlaneItemComponent {
  @Input()
  queue: IQueue;

  @Input()
  connectionId: string;

  @ViewChild('contextMenu')
  contextMenuReference: TemplateRef<any>

  constructor(
    private store: Store<State>,
    private contextMenu: ContextmenuService,
    private router: Router
  ) {}

  openContextMenu($event: Event): void {
    this.contextMenu.openContextmenu({
      templateRef: this.contextMenuReference, 
      target: $event.target as HTMLElement,
      width: 300,
    });
  
    $event.stopPropagation();
  }

  getMessages() {
    this.store.dispatch(getQueueMessages({connectionId: this.connectionId, queueName: this.queue.name, numberOfMessages: 10}));
    this.router.navigateByUrl('/messages/view');
  }
}
