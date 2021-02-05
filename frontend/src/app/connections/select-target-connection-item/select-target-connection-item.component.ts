import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IQueueSelectionEvent } from 'src/app/queues/models/IQueueSelectionEvent';
import { ISubscriptionSelectionEvent } from 'src/app/topics/models/ISubscriptionSelectionEvent';
import { ITopicSelectionEvent } from 'src/app/topics/models/ITopicSelectionEvent';
import { IConnection } from '../../../../../ipcModels';
import { ITargetSelectedEvent, TargetSelectionType } from '../models/ITargetSelectedEvent';

@Component({
  selector: 'app-select-target-connection-item',
  templateUrl: './select-target-connection-item.component.html',
  styleUrls: ['./select-target-connection-item.component.scss']
})
export class SelectTargetConnectionItemComponent implements OnChanges {
  @Input()
  connection: IConnection;

  @Input()
  allowedTargets: TargetSelectionType[];

  @Output()
  targetSelected = new EventEmitter<ITargetSelectedEvent>();

  subscriptionsAvailable: boolean = false;
  queuesAvailable: boolean = false;
  topicsAvailable: boolean = false;

  ngOnChanges(): void {
    this.queuesAvailable = this.allowedTargets.indexOf(TargetSelectionType.queue) >= 0;
    this.subscriptionsAvailable = this.allowedTargets.indexOf(TargetSelectionType.subscription) >= 0;
    this.topicsAvailable = this.subscriptionsAvailable || this.allowedTargets.indexOf(TargetSelectionType.topic) >= 0;
  }

  onQueueSelected(event: IQueueSelectionEvent) {
    const targetIndex = this.allowedTargets?.indexOf(TargetSelectionType.queue);
    if (targetIndex != null && targetIndex < 0) {
      return;
    }

    this.targetSelected.emit({
      connection: this.connection,
      type: TargetSelectionType.queue,
      name: event.queue.name
    })
  }

  onTopicSelected(event: ITopicSelectionEvent) {
    const targetIndex = this.allowedTargets?.indexOf(TargetSelectionType.topic);
    if (targetIndex != null && targetIndex < 0) {
      return;
    }

    this.targetSelected.emit({
      connection: this.connection,
      type: TargetSelectionType.topic,
      name: event.topic.name
    })
  }

  onSubscriptionSelected(event: ISubscriptionSelectionEvent) {
    const targetIndex = this.allowedTargets?.indexOf(TargetSelectionType.subscription);
    if (targetIndex != null && targetIndex < 0) {
      return;
    }
    this.targetSelected.emit({
      connection: this.connection,
      type: TargetSelectionType.subscription,
      name: `${event.topic.name}/${event.subscription.name}`
    })
  }
}
