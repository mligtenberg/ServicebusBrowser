import { TemplateRef, ViewChild, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { getSubscriptionMessages } from 'src/app/messages/ngrx/messages.actions';
import { State } from 'src/app/ngrx.module';
import { ContextmenuService } from 'src/app/ui/contextmenu.service';
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
  contextMenuReference: TemplateRef<any>

  constructor(
    private store: Store<State>,
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
  
  getMessages(deadletter: boolean) {
    this.store.dispatch(getSubscriptionMessages({
      connectionId: this.connectionId,
       topicName: this.topicName,
       subscriptionName: this.subscription.name,
       numberOfMessages: 10,
       deadletter}));
  }
}
