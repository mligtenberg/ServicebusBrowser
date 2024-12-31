import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollPanel } from 'primeng/scrollpanel';
import { TopologyTreeComponent } from '@service-bus-browser/topology-components';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import { Namespace, QueueWithMetaData, SubscriptionWithMetaData, TopicWithMetaData } from '@service-bus-browser/topology-contracts';
import { MenuItemCommandEvent } from 'primeng/api';
import { Store } from '@ngrx/store';
import {
  TopologyActions,
  TopologySelectors,
} from '@service-bus-browser/topology-store';
import { ConnectionsActions } from '@service-bus-browser/connections-store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, TopologyTreeComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  store = inject(Store);
  router = inject(Router);
  namespaces = this.store.selectSignal(TopologySelectors.selectNamespaces);

  namespaceContextMenuItems: SbbMenuItem<Namespace>[] = [
    {
      label: 'Remove Namespace',
      icon: 'pi pi-trash',
      onSelect: (data: Namespace, event: MenuItemCommandEvent) => {
        this.store.dispatch(ConnectionsActions.removeConnection({ connectionId: data.id }));
      },
    },
    {
      label: 'Add queue',
      icon: 'pi pi-plus',
      onSelect: async (data: Namespace, event: MenuItemCommandEvent) => {
        await this.router.navigate(['manage-topology', 'namespaces', data.id, 'queues', 'create']);
      },
    }
  ];

  queuesGroupNodeContextMenu: SbbMenuItem<Namespace>[] = [
    {
      label: 'Add queue',
      icon: 'pi pi-plus',
      onSelect: async (data: Namespace, event: MenuItemCommandEvent) => {
        await this.router.navigate(['manage-topology', 'namespaces', data.id, 'queues', 'create']);
      },
    },
  ];

  queueContextMenuItems: SbbMenuItem<QueueWithMetaData>[] = [
    {
      label: 'Edit Queue',
      icon: 'pi pi-pencil',
      onSelect: async (data: QueueWithMetaData, event: MenuItemCommandEvent) => {
        await this.router.navigate(['manage-topology', 'namespaces', data.namespaceId, 'queues', 'edit', data.id]);
      },
    },
    {
      label: 'Remove Queue',
      icon: 'pi pi-trash',
      onSelect: (data: QueueWithMetaData, event: MenuItemCommandEvent) => {
        this.store.dispatch(TopologyActions.removeQueue({ namespaceId: data.namespaceId, queueId: data.id }));
      },
    },
  ];

  async onQueueSelected($event: { namespaceId: string; queue: QueueWithMetaData }) {
    await this.router.navigate(['manage-topology', 'namespaces', $event.namespaceId, 'queues', 'edit', $event.queue.id]);
  }

  async onTopicSelected($event: { namespaceId: string; topic: TopicWithMetaData }) {
    await this.router.navigate(['manage-topology', 'namespaces', $event.namespaceId, 'topics', 'edit', $event.topic.id]);
  }

  async onSubscriptionSelected($event: {
    namespaceId: string;
    topicId: string;
    subscription: SubscriptionWithMetaData;
  }) {
    await this.router.navigate([
      'manage-topology',
      'namespaces',
      $event.namespaceId,
      'topics',
      $event.topicId,
      'subscriptions',
      'edit',
      $event.subscription.id,
    ]);
  }
}
