import { TemplateRef, ViewChild, Component, Input, Output, EventEmitter } from '@angular/core';
import { ISubscriptionSelectionEvent, SubscriptionSelectionType } from '../models/ISubscriptionSelectionEvent';
import { ISubscription, ITopic } from '../ngrx/topics.models';

@Component({
  selector: 'app-topic-plane-subscription',
  templateUrl: './topic-plane-subscription.component.html',
  styleUrls: ['./topic-plane-subscription.component.scss']
})
export class TopicPlaneSubscriptionComponent {
  @Input() connectionId: string;
  @Input() topic: ITopic;
  @Input() subscription: ISubscription;

  @Output() selected = new EventEmitter<ISubscriptionSelectionEvent>();
  @Output() contextMenuSelected = new EventEmitter<ISubscriptionSelectionEvent>();

  @ViewChild('contextMenu')
  contextMenuReference: TemplateRef<any>;

  onSelected($event: MouseEvent) {
    this.selected.emit({
      clickPosition: {
        clientX: $event.clientX,
        clientY: $event.clientY
      },
      type: SubscriptionSelectionType.click,
      topic: this.topic,
      subscription: this.subscription
    })
  }

  onContextMenuSelected($event: MouseEvent) {
    this.contextMenuSelected.emit({
      clickPosition: {
        clientX: $event.clientX,
        clientY: $event.clientY
      },
      type: SubscriptionSelectionType.contextMenu,
      topic: this.topic,
      subscription: this.subscription
    })
  }
}
