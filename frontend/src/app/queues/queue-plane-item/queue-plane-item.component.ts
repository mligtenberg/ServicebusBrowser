import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { IQueueSelectionEvent, QueueSelectionType } from '../models/IQueueSelectionEvent';
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

  @Output()
  selected = new EventEmitter<IQueueSelectionEvent>();

  @Output()
  contextMenuSelected = new EventEmitter<IQueueSelectionEvent>();

  onClick($event: MouseEvent) {
    this.selected.emit({
      type: QueueSelectionType.click,
      clickPosition: {
        clientX: $event.clientX,
        clientY: $event.clientY
      },
      queue: this.queue
    });
  }

  onContextMenu($event: MouseEvent) {
    this.contextMenuSelected.emit({
      type: QueueSelectionType.contextMenu,
      clickPosition: {
        clientX: $event.clientX,
        clientY: $event.clientY
      },
      queue: this.queue
    });
  }
}
