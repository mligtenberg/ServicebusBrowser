import { Component, ComponentFactoryResolver, Injector, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IConnection } from 'src/app/connections/ngrx/connections.models';
import { ContextmenuService } from 'src/app/ui/contextmenu.service';
import { IQueueSelectionEvent } from '../models/IQueueSelectionEvent';
import { IQueue } from '../ngrx/queues.models';
import { QueueContextMenuComponent } from '../queue-context-menu/queue-context-menu.component';

@Component({
  selector: 'app-queue-plane',
  templateUrl: './queue-plane.component.html',
  styleUrls: ['./queue-plane.component.scss']
})
export class QueuePlaneComponent {
  @Input()
  connection: IConnection;

  queue: IQueue;

  @ViewChild('queueContextMenu')
  queueContextMenu: TemplateRef<any>;

  constructor(
    private router: Router,
    private contextMenu: ContextmenuService
  ) {};

  onQueueSelected($event: IQueueSelectionEvent) {
    this.router.navigate(['queues', 'view', this.connection.id, $event.queue.name])
  }

  onQueueContextMenuSelected($event: IQueueSelectionEvent) {
    this.queue = $event.queue;

    // make sure that other menus are closed
    this.contextMenu.closeContextmenu();
    this.contextMenu.openContextmenu({
      templateRef: this.queueContextMenu,
      mousePosition: {
        x: $event.clickPosition.clientX,
        y: $event.clickPosition.clientY
      },
      width: 350
    });
  }
}
