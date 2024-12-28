import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollPanel } from 'primeng/scrollpanel';
import { TopologyTreeComponent } from '@service-bus-browser/topology-components';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { Namespace, Queue, Subscription, Topic } from '@service-bus-browser/topology-contracts';
import { MenuItemCommandEvent } from 'primeng/api';
import { Store } from '@ngrx/store';
import {
  TopologyActions,
  TopologySelectors,
} from '@service-bus-browser/topology-store';
import { ConnectionsActions } from '@service-bus-browser/connections-store';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, TopologyTreeComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  store = inject(Store);
  namespaces = this.store.selectSignal(TopologySelectors.selectNamespaces);

  namespaceContextMenuItems: SbbMenuItem<Namespace>[] = [
    {
      label: 'Remove Namespace',
      onSelect: (data: Namespace, event: MenuItemCommandEvent) => {
        this.store.dispatch(ConnectionsActions.removeConnection({ connectionId: data.id }));
      },
    },
  ];

  onNamespaceSelected($event: { namespace: Namespace }) {
    console.log($event);
  }

  onQueueSelected($event: { namespaceId: string; queue: Queue }) {
    console.log($event);
  }

  onTopicSelected($event: { namespaceId: string; topic: Topic }) {
    console.log($event);
  }

  onSubscriptionSelected($event: {
    namespaceId: string;
    topicId: string;
    subscription: Subscription;
  }) {
    console.log($event);
  }
}
