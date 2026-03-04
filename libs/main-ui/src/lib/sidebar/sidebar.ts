import { Component, computed, inject, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollPanel } from 'primeng/scrollpanel';
import { TopologyTreeComponent } from '@service-bus-browser/topology-components';
import { SbbMenuItem, UUID } from '@service-bus-browser/shared-contracts';
import {
  Namespace,
  QueueWithMetaData,
  SubscriptionRule,
  SubscriptionWithMetaData,
  TopicWithMetaData,
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
import { TasksSelectors } from '@service-bus-browser/tasks-store';
import { MessagesActions } from '@service-bus-browser/messages-store';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { ColorThemeService } from '@service-bus-browser/services';
import { SelectButton } from 'primeng/selectbutton';
import { ServiceBusMessageChannels } from '@service-bus-browser/message-queue-contracts';

@Component({
  selector: 'lib-sidebar',
  imports: [
    CommonModule,
    TopologyTreeComponent,
    TasksComponent,
    ScrollPanel,
    Dialog,
    FloatLabel,
    InputNumber,
    ReactiveFormsModule,
    FormsModule,
    Button,
    SelectButton,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  store = inject(Store);
  router = inject(Router);
  loadMessagesDialogVisible = computed(
    () => this.currentEndpoint() !== undefined,
  );
  currentEndpoint = signal<
    | undefined
    | {
        connectionId: UUID;
        queueName: string;
        channel: ServiceBusMessageChannels;
      }
    | {
        connectionId: UUID;
        topicName: string;
        subscriptionName: string;
        channel: ServiceBusMessageChannels;
      }
  >(undefined);
  maxAmount = model<number>(10);
  fromSequenceNumber = model<number>(0);

  receiveTypes = ['peek', 'receive'];
  receiveType = model<'peek' | 'receive'>('peek');

  namespaceContextMenuItems: SbbMenuItem<Namespace>[] = [
    {
      label: 'Remove Namespace',
      icon: 'pi pi-trash',
      supportedMultiSelection: true,
      onSelect: (
        data: Namespace | Namespace[],
        event: MenuItemCommandEvent,
      ) => {
        data = Array.isArray(data) ? data : [data];
        for (const namespace of data) {
          this.store.dispatch(
            ConnectionsActions.removeConnection({ connectionId: namespace.id }),
          );
        }
      },
    },
    {
      label: 'Add queue',
      icon: 'pi pi-plus',
      supportedMultiSelection: false,
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
      supportedMultiSelection: false,
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
      supportedMultiSelection: false,
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
      supportedMultiSelection: false,
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

  topicContextMenuItems: SbbMenuItem<TopicWithMetaData>[] = [
    {
      label: 'Add Subscription',
      icon: 'pi pi-plus',
      supportedMultiSelection: false,
      onSelect: async (
        data: TopicWithMetaData,
        event: MenuItemCommandEvent,
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
      supportedMultiSelection: false,
    },
    {
      label: 'Edit Topic',
      icon: 'pi pi-pencil',
      supportedMultiSelection: false,
      onSelect: async (
        data: TopicWithMetaData,
        event: MenuItemCommandEvent,
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
      supportedMultiSelection: true,
      onSelect: (
        data: TopicWithMetaData | TopicWithMetaData[],
        event: MenuItemCommandEvent,
      ) => {
        data = Array.isArray(data) ? data : [data];

        for (const topic of data) {
          this.store.dispatch(
            TopologyActions.removeTopic({
              namespaceId: topic.namespaceId,
              topicId: topic.id,
            }),
          );
        }
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
          }),
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

  darkMode = inject(ColorThemeService).darkMode;

  openTasks = this.store.selectSignal(TasksSelectors.selectTasks);

  private openLoadDialog(
    endpoint:
      | {
          connectionId: UUID;
          queueName: string;
          channel: ServiceBusMessageChannels;
        }
      | {
          connectionId: UUID;
          topicName: string;
          subscriptionName: string;
          channel: ServiceBusMessageChannels;
        },
  ) {
    this.maxAmount.set(100);
    this.fromSequenceNumber.set(0);
    this.receiveType.set('peek');
    this.currentEndpoint.set(endpoint);
  }

  loadMessages() {
    const currentEndpoint = this.currentEndpoint();
    if (currentEndpoint === undefined) {
      return;
    }

    // this.store.dispatch(
    //   MessagesActions.loadMessages({
    //     endpoint: currentEndpoint,
    //     maxAmount: this.maxAmount(),
    //     fromSequenceNumber: this.fromSequenceNumber().toString(),
    //     receiveType: this.receiveType(),
    //   }),
    // );

    this.currentEndpoint.set(undefined);
  }

  cancelLoadMessages() {
    this.currentEndpoint.set(undefined);
  }
}
