import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Namespace,
  NamespaceWithChildren,
  Queue,
  Subscription, Topic,
  TopicWithChildren
} from '@service-bus-browser/topology-contracts';
import { Tree, TreeNodeCollapseEvent, TreeNodeExpandEvent } from 'primeng/tree';
import { PrimeTemplate, TreeNode } from 'primeng/api';
import { NamespaceTreeNodeComponent } from '../namespace-tree-node/namespace-tree-node.component';
import { TopicTreeNodeComponent } from '../topic-tree-node/topic-tree-node.component';
import { SubscriptionTreeNodeComponent } from '../subscription-tree-node/subscription-tree-node.component';
import { QueueTreeNodeComponent } from '../queue-tree-node/queue-tree-node.component';
import { Button } from 'primeng/button';
import { Store } from '@ngrx/store';
import { TopologyActions } from '@service-bus-browser/topology-store';
import { SbbMenuItem, UUID } from '@service-bus-browser/shared-contracts';

@Component({
  selector: 'sbb-tpl-topology-tree',
  imports: [
    CommonModule,
    Tree,
    NamespaceTreeNodeComponent,
    TopicTreeNodeComponent,
    SubscriptionTreeNodeComponent,
    QueueTreeNodeComponent,
    PrimeTemplate,
    Button,
  ],
  templateUrl: './topology-tree.component.html',
  styleUrl: './topology-tree.component.scss',
})
export class TopologyTreeComponent {
  namespaces =
    input.required<NamespaceWithChildren<Queue, TopicWithChildren>[]>();
  namespaceContextMenuItems = input<SbbMenuItem<Namespace>[]>();
  queueContextMenu = input<SbbMenuItem<Queue>[]>();
  topicContextMenu = input<SbbMenuItem<Topic>[]>();
  subscriptionContextMenu = input<SbbMenuItem<Subscription>[]>();

  displayQueues = input<boolean>(true);
  displayTopics = input<boolean>(true);
  displaySubscriptions = input<boolean>(true);

  store = inject(Store);

  opened = signal<string[]>([]);

  nodes = computed<TreeNode[]>(() =>
    this.namespaces().map<TreeNode>((ns) => {
      const node: TreeNode = {
        key: ns.id,
        label: ns.name,
        type: 'namespace',
        data: ns,
        children: [],
        expanded: this.opened().includes(ns.id),
      };

      if (this.displayQueues()) {
        node.children?.push({
          key: `${ns.id}-queues`,
          label: 'Queues',
          type: 'queues',
          selectable: false,
          data: ns.id,
          expanded: this.opened().includes(`${ns.id}-queues`),
          children: ns.queues.map<TreeNode>((queue) => ({
            key: `${ns.id}-queue-${queue.id}`,
            label: queue.name,
            type: 'queue',
            data: {
              namespace: ns,
              queue,
            },
            leaf: true,
          })),
        });
      }

      if (this.displayTopics()) {
        node.children?.push({
          key: `${ns.id}-topics`,
          label: 'Topics',
          type: 'topics',
          selectable: false,
          data: ns.id,
          expanded: this.opened().includes(`${ns.id}-topics`),
          children: ns.topics.map<TreeNode>((topic) => {
            const topNode: TreeNode = {
              key: `${ns.id}-topic-${topic.id}`,
              expanded: this.opened().includes(`${ns.id}-topic-${topic.id}`),
              label: topic.name,
              type: 'topic',
              data: {
                namespace: ns,
                topic,
              },
            };

            if (this.displaySubscriptions()) {
              topNode.children = topic.subscriptions.map<TreeNode>((sub) => ({
                key: `${ns.id}-topic-${topic.id}-subscription-${sub.id}`,
                label: sub.name,
                type: 'subscription',
                data: {
                  namespace: ns,
                  topic,
                  subscription: sub,
                },
                leaf: true,
              }))
            }

            return topNode;
          }),
        });
      }

      return node;
    })
  );

  namespaceSelected = output<{
    namespace: Namespace;
  }>();
  queueSelected = output<{
    namespaceId: string;
    queue: Queue;
  }>();
  topicSelected = output<{
    namespaceId: string;
    topic: TopicWithChildren;
  }>();
  subscriptionSelected = output<{
    namespaceId: string;
    topicId: string;
    subscription: Subscription;
  }>();

  onSelectionChange(event: TreeNode | TreeNode[] | null) {
    // should not be an array since we have selection mode single
    if (!event || event instanceof Array) {
      return;
    }

    switch (event.type) {
      case 'namespace':
        this.onNamespaceSelected(event.data);
        break;
      case 'queue':
        this.onQueueSelected(event.data.namespace, event.data.queue);
        break;
      case 'topic':
        this.onTopicSelected(event.data.namespace, event.data.topic);
        break;
      case 'subscription':
        this.onSubscriptionSelected(
          event.data.namespace,
          event.data.topic,
          event.data.subscription
        );
        break;
    }
  }

  onNodeExpand(event: TreeNodeExpandEvent) {
    this.opened.update((opened) => [
      ... new Set([...opened, event.node.key as string]),
    ]);
  }

  onNodeCollapse(event: TreeNodeCollapseEvent) {
    this.opened.update((opened) =>
      opened.filter((key) => key !== event.node.key)
    );
  }

  private onNamespaceSelected(namespace: Namespace) {
    this.namespaceSelected.emit({
      namespace,
    });
  }

  private onQueueSelected(namespace: Namespace, queue: Queue) {
    this.queueSelected.emit({
      namespaceId: namespace.id,
      queue,
    });
  }

  private onTopicSelected(namespace: Namespace, topic: TopicWithChildren) {
    this.topicSelected.emit({
      namespaceId: namespace.id,
      topic,
    });
  }

  private onSubscriptionSelected(
    namespace: Namespace,
    topic: TopicWithChildren,
    subscription: Subscription
  ) {
    this.subscriptionSelected.emit({
      namespaceId: namespace.id,
      topicId: topic.id,
      subscription,
    });
  }

  refreshQueues($event: MouseEvent, namespaceId: UUID) {
    this.store.dispatch(TopologyActions.loadQueues({ namespaceId }));
    $event.stopPropagation();
  }

  refreshTopics($event: MouseEvent, namespaceId: UUID) {
    this.store.dispatch(TopologyActions.loadTopics({ namespaceId }));
    $event.stopPropagation();
  }

  refreshSubscriptions(namespaceId: UUID, topicId: string) {
    this.store.dispatch(
      TopologyActions.loadSubscriptions({ namespaceId, topicId })
    );
  }
}
