import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollPanel } from 'primeng/scrollpanel';
import { TopologyTreeComponent } from '@service-bus-browser/topology-components';
import { SbbMenuItem } from '@service-bus-browser/shared-contracts';
import {
  Namespace,
  QueueWithMetaData,
  SubscriptionRule,
  SubscriptionWithMetaData,
  TopicWithMetaData
} from '@service-bus-browser/topology-contracts';
import { MenuItemCommandEvent } from 'primeng/api';
import { Store } from '@ngrx/store';
import {
  TopologyActions,
  TopologySelectors,
} from '@service-bus-browser/topology-store';
import { ConnectionsActions } from '@service-bus-browser/connections-store';
import { Router } from '@angular/router';
import { TasksComponent } from '@service-bus-browser/tasks-components';
import { Task } from '@service-bus-browser/tasks-contracts';
import { TasksSelectors } from '@service-bus-browser/tasks-store';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, TopologyTreeComponent, TasksComponent, ScrollPanel],
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
        this.store.dispatch(
          ConnectionsActions.removeConnection({ connectionId: data.id })
        );
      },
    },
    {
      label: 'Add queue',
      icon: 'pi pi-plus',
      onSelect: async (data: Namespace, event: MenuItemCommandEvent) => {
        await this.router.navigate([
          'manage-topology',
          'namespaces',
          data.id,
          'queues',
          'create',
        ]);
      },
    },
    {
      label: 'Add topic',
      icon: 'pi pi-plus',
      onSelect: async (data: Namespace, event: MenuItemCommandEvent) => {
        await this.router.navigate([
          'manage-topology',
          'namespaces',
          data.id,
          'topics',
          'create',
        ]);
      },
    },
  ];

  queuesGroupNodeContextMenu: SbbMenuItem<Namespace>[] = [
    {
      label: 'Add queue',
      icon: 'pi pi-plus',
      onSelect: async (data: Namespace, event: MenuItemCommandEvent) => {
        await this.router.navigate([
          'manage-topology',
          'namespaces',
          data.id,
          'queues',
          'create',
        ]);
      },
    },
  ];

  topicsGroupNodeContextMenu: SbbMenuItem<Namespace>[] = [
    {
      label: 'Add topic',
      icon: 'pi pi-plus',
      onSelect: async (data: Namespace, event: MenuItemCommandEvent) => {
        await this.router.navigate([
          'manage-topology',
          'namespaces',
          data.id,
          'topics',
          'create',
        ]);
      },
    },
  ];

  queueContextMenuItems: SbbMenuItem<QueueWithMetaData>[] = [
    {
      label: 'Edit Queue',
      icon: 'pi pi-pencil',
      onSelect: async (
        data: QueueWithMetaData,
        event: MenuItemCommandEvent
      ) => {
        await this.router.navigate([
          'manage-topology',
          'namespaces',
          data.namespaceId,
          'queues',
          'edit',
          data.id,
        ]);
      },
    },
    {
      label: 'Remove Queue',
      icon: 'pi pi-trash',
      onSelect: (data: QueueWithMetaData, event: MenuItemCommandEvent) => {
        this.store.dispatch(
          TopologyActions.removeQueue({
            namespaceId: data.namespaceId,
            queueId: data.id,
          })
        );
      },
    },
  ];

  topicContextMenuItems: SbbMenuItem<TopicWithMetaData>[] = [
    {
      label: 'Add Subscription',
      icon: 'pi pi-plus',
      onSelect: async (
        data: TopicWithMetaData,
        event: MenuItemCommandEvent
      ) => {
        await this.router.navigate([
          'manage-topology',
          'namespaces',
          data.namespaceId,
          'topics',
          data.id,
          'subscriptions',
          'create',
        ]);
      },
    },
    {
      separator: true,
    },
    {
      label: 'Edit Topic',
      icon: 'pi pi-pencil',
      onSelect: async (
        data: TopicWithMetaData,
        event: MenuItemCommandEvent
      ) => {
        await this.router.navigate([
          'manage-topology',
          'namespaces',
          data.namespaceId,
          'topics',
          'edit',
          data.id,
        ]);
      },
    },
    {
      label: 'Remove Topic',
      icon: 'pi pi-trash',
      onSelect: (data: TopicWithMetaData, event: MenuItemCommandEvent) => {
        this.store.dispatch(
          TopologyActions.removeTopic({
            namespaceId: data.namespaceId,
            topicId: data.id,
          })
        );
      },
    },
  ];

  subscriptionContextMenuItems: SbbMenuItem<SubscriptionWithMetaData>[] = [
    {
      label: 'Add Rule',
      icon: 'pi pi-plus',
      onSelect: async (
        data: SubscriptionWithMetaData,
        event: MenuItemCommandEvent
      ) => {
        await this.router.navigate([
          'manage-topology',
          'namespaces',
          data.namespaceId,
          'topics',
          data.topicId,
          'subscriptions',
          data.id,
          'rules',
          'create',
        ]);
      },
    },
    {
      separator: true,
    },
    {
      label: 'Edit Subscription',
      icon: 'pi pi-pencil',
      onSelect: (
        data: SubscriptionWithMetaData,
        event: MenuItemCommandEvent
      ): void => {
        this.router.navigate([
          'manage-topology',
          'namespaces',
          data.namespaceId,
          'topics',
          data.topicId,
          'subscriptions',
          'edit',
          data.id,
        ]);
      },
    },
    {
      label: 'Remove Subscription',
      icon: 'pi pi-trash',
      onSelect: (
        data: SubscriptionWithMetaData,
        event: MenuItemCommandEvent
      ) => {
        this.store.dispatch(
          TopologyActions.removeSubscription({
            namespaceId: data.namespaceId,
            topicId: data.topicId,
            subscriptionId: data.id,
          })
        );
      },
    },
  ];

  subscriptionRuleContextMenuItems: SbbMenuItem<SubscriptionRule>[] = [
    {
      label: 'Edit Rule',
      icon: 'pi pi-pencil',
      onSelect: async (data: SubscriptionRule, event: MenuItemCommandEvent) => {
        await this.router.navigate([
          'manage-topology',
          'namespaces',
          data.namespaceId,
          'topics',
          data.topicId,
          'subscriptions',
          data.subscriptionId,
          'rules',
          'edit',
          data.name,
        ]);
      },
    },
    {
      label: 'Remove Rule',
      icon: 'pi pi-trash',
      onSelect: (data: SubscriptionRule, event: MenuItemCommandEvent) => {
        this.store.dispatch(
          TopologyActions.removeSubscriptionRule({
            namespaceId: data.namespaceId,
            topicId: data.topicId,
            subscriptionId: data.subscriptionId,
            ruleName: data.name,
          })
        );
      },
    },
  ];

  async onQueueSelected($event: {
    namespaceId: string;
    queue: QueueWithMetaData;
  }) {
    await this.router.navigate([
      'manage-topology',
      'namespaces',
      $event.namespaceId,
      'queues',
      'edit',
      $event.queue.id,
    ]);
  }

  async onTopicSelected($event: {
    namespaceId: string;
    topic: TopicWithMetaData;
  }) {
    await this.router.navigate([
      'manage-topology',
      'namespaces',
      $event.namespaceId,
      'topics',
      'edit',
      $event.topic.id,
    ]);
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

  async onSubscriptionRuleSelected($event: {
    namespaceId: string;
    topicId: string;
    subscriptionId: string;
    ruleName: string;
  }) {
    await this.router.navigate([
      'manage-topology',
      'namespaces',
      $event.namespaceId,
      'topics',
      $event.topicId,
      'subscriptions',
      $event.subscriptionId,
      'rules',
      'edit',
      $event.ruleName,
    ]);
  }

  openTasks = this.store.selectSignal(TasksSelectors.selectTasks);
}
