import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContextmenuService } from 'src/app/ui/contextmenu.service';
import { IConnection } from '../../../../../ipcModels/IConnection';
import { ISubscriptionSelectionEvent } from '../models/ISubscriptionSelectionEvent';
import { ITopicSelectionEvent } from '../models/ITopicSelectionEvent';
import { ISubscription, ITopic } from '../ngrx/topics.models';

@Component({
  selector: 'app-topics-plane',
  templateUrl: './topics-plane.component.html',
  styleUrls: ['./topics-plane.component.scss']
})
export class TopicsPlaneComponent {
  @Input()
  connection: IConnection;

  @ViewChild('subscriptionContextMenu')
  subscriptionContextMenu: TemplateRef<any>

  selectedTopic: ITopic;
  selectedSubscription: ISubscription;

  topics: ITopic[];

  topicsSubscription: Subscription;
  loading: boolean = false;

  constructor(
    private router: Router,
    private contextMenu: ContextmenuService
  ) { }

  onTopicSelected($event: ITopicSelectionEvent) {
    this.router.navigate(['topics', 'view', this.connection.id, $event.topic.name]);
  }

  onSubscriptionSelected($event: ISubscriptionSelectionEvent) {
    this.router.navigate(['topics', 'view', this.connection.id, $event.topic.name, $event.subscription.name]);
  }

  onSubscriptionContextMenuSelected($event: ISubscriptionSelectionEvent) {
    // ensure previous menu has closed
    this.contextMenu.closeContextmenu();

    this.selectedTopic = $event.topic;
    this.selectedSubscription = $event.subscription;

    this.contextMenu.openContextmenu({
      templateRef: this.subscriptionContextMenu,
      mousePosition: {
        x: $event.clickPosition.clientX,
        y: $event.clickPosition.clientY
      },
      width: 350
    })
  }
}
