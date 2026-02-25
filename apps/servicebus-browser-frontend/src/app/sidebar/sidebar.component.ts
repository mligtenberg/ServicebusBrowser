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
import { TasksSelectors } from '@service-bus-browser/tasks-store';
import { MessagesActions } from '@service-bus-browser/messages-store';
import { Dialog } from 'primeng/dialog';
import { MessageChannels } from '@service-bus-browser/service-bus-contracts';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { ColorThemeService } from '@service-bus-browser/services';

@Component({
  selector: 'app-sidebar',
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
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  store = inject(Store);
  router = inject(Router);
  namespaces = this.store.selectSignal(TopologySelectors.selectNamespaces);
  loadMessagesDialogVisible = computed(
    () => this.currentEndpoint() !== undefined
  );
  currentEndpoint = signal<
    | undefined
    | { connectionId: UUID; queueName: string; channel: MessageChannels }
    | {
        connectionId: UUID;
        topicName: string;
        subscriptionName: string;
        channel: MessageChannels;
      }
  >(undefined);
  maxAmount = model<number>(10);
  fromSequenceNumber = model<number>(0);

  namespaceContextMenuItems: SbbMenuItem<Namespace>[] = [
    {
      label: 'Remove Namespace',
      icon: 'pi pi-trash',
      supportedMultiSelection: true,
      onSelect: (data: Namespace | Namespace[], event: MenuItemCommandEvent) => {
        data = Array.isArray(data) ? data : [data];
        for (const namespace of data) {
          this.store.dispatch(
            ConnectionsActions.removeConnection({ connectionId: namespace.id })
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

  queueContextMenuItems: SbbMenuItem<QueueWithMetaData>[] = [
    {
      label: 'Peek messages',
      icon: 'pi pi-download',
      supportedMultiSelection: false,
      onSelect: async (
        data: QueueWithMetaData,
        event: MenuItemCommandEvent
      ) => {
        this.openLoadDialog({
          connectionId: data.namespaceId,
          queueName: data.name,
          channel: undefined,
        });
      },
    },
    {
      label: 'Peek deadletter messages',
      icon: 'pi pi-download',
      supportedMultiSelection: false,
      onSelect: async (
        data: QueueWithMetaData,
        event: MenuItemCommandEvent
      ) => {
        this.openLoadDialog({
          connectionId: data.namespaceId,
          queueName: data.name,
          channel: 'deadLetter',
        });
      },
    },
    {
      label: 'Peek transfer deadletter messages',
      icon: 'pi pi-download',
      supportedMultiSelection: false,
      onSelect: async (
        data: QueueWithMetaData,
        event: MenuItemCommandEvent
      ) => {
        this.openLoadDialog({
          connectionId: data.namespaceId,
          queueName: data.name,
          channel: 'transferDeadLetter',
        });
      },
    },
    {
      separator: true,
    },
    {
      label: 'Clear messages',
      icon: 'pi pi-eraser',
      supportedMultiSelection: true,
      onSelect: (data: QueueWithMetaData | QueueWithMetaData[], event: MenuItemCommandEvent) => {
        data = Array.isArray(data) ? data : [data];

        for (const queue of data) {
          this.store.dispatch(
            MessagesActions.clearEndpoint({
              endpoint: {
                queueName: queue.name,
                channel: undefined,
                connectionId: queue.namespaceId,
              },
              messagesToClearCount: queue.metaData.activeMessageCount
            })
          );
        }
      }
    },
    {
      label: 'Clear deadletter messages',
      icon: 'pi pi-eraser',
      supportedMultiSelection: true,
      onSelect: (data: QueueWithMetaData | QueueWithMetaData[], event: MenuItemCommandEvent) => {
        data = Array.isArray(data) ? data : [data];

        for (const queue of data) {
          this.store.dispatch(
            MessagesActions.clearEndpoint({
              endpoint: {
                queueName: queue.name,
                channel: 'deadLetter',
                connectionId: queue.namespaceId,
              },
              messagesToClearCount: queue.metaData.deadLetterMessageCount
            })
          );
        }
      }
    },
    {
      label: 'Clear transfer deadletter messages',
      icon: 'pi pi-eraser',
      supportedMultiSelection: true,
      onSelect: (data: QueueWithMetaData | QueueWithMetaData[], event: MenuItemCommandEvent) => {
        data = Array.isArray(data) ? data : [data];

        for (const queue of data) {
          this.store.dispatch(
            MessagesActions.clearEndpoint({
              endpoint: {
                queueName: queue.name,
                channel: 'transferDeadLetter',
                connectionId: queue.namespaceId,
              },
              messagesToClearCount: queue.metaData.transferDeadLetterMessageCount
            })
          );
        }
      }
    },
    {
      separator: true,
      supportedMultiSelection: true,
    },
    {
      label: 'Edit Queue',
      icon: 'pi pi-pencil',
      supportedMultiSelection: false,
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
      supportedMultiSelection: true,
      onSelect: (data: QueueWithMetaData | QueueWithMetaData[], event: MenuItemCommandEvent) => {
        data = Array.isArray(data) ? data : [data];

        for (const queue of data) {
          this.store.dispatch(
            TopologyActions.removeQueue({
              namespaceId: queue.namespaceId,
              queueId: queue.id,
            })
          );
        }
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
      supportedMultiSelection: false,
    },
    {
      label: 'Edit Topic',
      icon: 'pi pi-pencil',
      supportedMultiSelection: false,
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
      supportedMultiSelection: true,
      onSelect: (data: TopicWithMetaData | TopicWithMetaData[], event: MenuItemCommandEvent) => {
        data = Array.isArray(data) ? data : [data];

        for (const topic of data) {
          this.store.dispatch(
            TopologyActions.removeTopic({
              namespaceId: topic.namespaceId,
              topicId: topic.id,
            })
          );
        }
      },
    },
  ];

  subscriptionContextMenuItems: SbbMenuItem<SubscriptionWithMetaData>[] = [
    {
      label: 'Peek messages',
      icon: 'pi pi-download',
      supportedMultiSelection: false,
      onSelect: async (
        data: SubscriptionWithMetaData,
        event: MenuItemCommandEvent
      ) => {
        this.openLoadDialog({
          connectionId: data.namespaceId,
          topicName: data.topicId,
          subscriptionName: data.name,
          channel: undefined
        });
      },
    },
    {
      label: 'Peek deadletter messages',
      icon: 'pi pi-download',
      supportedMultiSelection: false,
      onSelect: async (
        data: SubscriptionWithMetaData,
        event: MenuItemCommandEvent
      ) => {
        this.openLoadDialog({
          connectionId: data.namespaceId,
          topicName: data.topicId,
          subscriptionName: data.name,
          channel: 'deadLetter'
        });
      },
    },
    {
      label: 'Peek transfer deadletter messages',
      icon: 'pi pi-download',
      supportedMultiSelection: false,
      onSelect: async (
        data: SubscriptionWithMetaData,
        event: MenuItemCommandEvent
      ) => {
        this.openLoadDialog({
          connectionId: data.namespaceId,
          topicName: data.topicId,
          subscriptionName: data.name,
          channel: 'transferDeadLetter'
        });
      },
    },
    {
      separator: true,
    },
    {
      label: 'Clear messages',
      icon: 'pi pi-eraser',
      supportedMultiSelection: true,
      onSelect: (data: SubscriptionWithMetaData | SubscriptionWithMetaData[], event: MenuItemCommandEvent) => {
        data = Array.isArray(data) ? data : [data];

        for (const subscription of data) {
          this.store.dispatch(
            MessagesActions.clearEndpoint({
              endpoint: {
                channel: undefined,
                connectionId: subscription.namespaceId,
                topicName: subscription.topicId,
                subscriptionName: subscription.name,
              },
              messagesToClearCount: subscription.metaData.activeMessageCount
            })
          );
        }
      }
    },
    {
      label: 'Clear deadletter messages',
      icon: 'pi pi-eraser',
      supportedMultiSelection: true,
      onSelect: (data: SubscriptionWithMetaData | SubscriptionWithMetaData[], event: MenuItemCommandEvent) => {
        data = Array.isArray(data) ? data : [data];
        for (const subscription of data) {
          this.store.dispatch(
            MessagesActions.clearEndpoint({
              endpoint: {
                connectionId: subscription.namespaceId,
                topicName: subscription.topicId,
                subscriptionName: subscription.name,
                channel: 'deadLetter',
              },
              messagesToClearCount: subscription.metaData.deadLetterMessageCount
            })
          );
        }
      }
    },
    {
      label: 'Clear transfer deadletter messages',
      icon: 'pi pi-eraser',
      supportedMultiSelection: true,
      onSelect: (data: SubscriptionWithMetaData | SubscriptionWithMetaData[], event: MenuItemCommandEvent) => {
        data = Array.isArray(data) ? data : [data];
        for (const subscription of data) {
          this.store.dispatch(
            MessagesActions.clearEndpoint({
              endpoint: {
                connectionId: subscription.namespaceId,
                topicName: subscription.topicId,
                subscriptionName: subscription.name,
                channel: 'transferDeadLetter',
              },
              messagesToClearCount: subscription.metaData.transferDeadLetterMessageCount
            })
          );
        }
      }
    },
    {
      separator: true,
      supportedMultiSelection: true,
    },
    {
      label: 'Add Rule',
      icon: 'pi pi-plus',
      supportedMultiSelection: false,
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
      supportedMultiSelection: false,
    },
    {
      label: 'Edit Subscription',
      icon: 'pi pi-pencil',
      supportedMultiSelection: false,
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
      supportedMultiSelection: true,
      onSelect: (
        data: SubscriptionWithMetaData | SubscriptionWithMetaData[],
        event: MenuItemCommandEvent
      ) => {
        data = Array.isArray(data) ? data : [data];

        for (const subscription of data) {
          this.store.dispatch(
            TopologyActions.removeSubscription({
              namespaceId: subscription.namespaceId,
              topicId: subscription.topicId,
              subscriptionId: subscription.id,
            })
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

  darkMode = inject(ColorThemeService).darkMode;

  openTasks = this.store.selectSignal(TasksSelectors.selectTasks);

  private openLoadDialog(
    endpoint:
      | { connectionId: UUID; queueName: string; channel: MessageChannels }
      | {
          connectionId: UUID;
          topicName: string;
          subscriptionName: string;
          channel: MessageChannels;
        }
  ) {
    this.maxAmount.set(100);
    this.fromSequenceNumber.set(0);
    this.currentEndpoint.set(endpoint);
  }

  loadMessages() {
    const currentEndpoint = this.currentEndpoint();
    if (currentEndpoint === undefined) {
      return;
    }

    this.store.dispatch(
      MessagesActions.loadMessages({
        endpoint: currentEndpoint,
        maxAmount: this.maxAmount(),
        fromSequenceNumber: this.fromSequenceNumber().toString(),
      })
    );

    this.currentEndpoint.set(undefined);
  }

  cancelLoadMessages() {
    this.currentEndpoint.set(undefined);
  }
}
