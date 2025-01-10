import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Namespace,
  QueueWithMetaData,
  SubscriptionWithMetaData, TopicWithMetaData,
  TopicWithChildren, SubscriptionRule, NamespaceWithChildrenAndLoadingState
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
import { ContextMenuComponent } from '@service-bus-browser/shared-components';
import {
  SubscriptionRuleTreeNodeComponent
} from '../subscription-rule-tree-node/subscription-rule-tree-node.component';

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
    ContextMenuComponent,
    SubscriptionRuleTreeNodeComponent,
  ],
  templateUrl: './topology-tree.component.html',
  styleUrl: './topology-tree.component.scss',
})
export class TopologyTreeComponent {
  namespaces =
    input.required<NamespaceWithChildrenAndLoadingState[]>();
  namespaceContextMenuItems = input<SbbMenuItem<Namespace>[]>();
  queuesGroupNodeContextMenu = input<SbbMenuItem<Namespace>[]>();
  topicsGroupNodeContextMenu = input<SbbMenuItem<Namespace>[]>();
  queueContextMenu = input<SbbMenuItem<QueueWithMetaData>[]>();
  topicContextMenu = input<SbbMenuItem<TopicWithMetaData>[]>();
  subscriptionContextMenu = input<SbbMenuItem<SubscriptionWithMetaData>[]>();
  subscriptionRuleContextMenu = input<SbbMenuItem<SubscriptionRule>[]>();

  connectionsFilter = input<string[]>();

  displayQueues = input<boolean>(true);
  displayTopics = input<boolean>(true);
  displaySubscriptions = input<boolean>(true);
  displaySubscriptionRules = input<boolean>(true);

  store = inject(Store);

  opened = signal<string[]>([]);

  nodes = computed<TreeNode[]>(() => {
    return this.namespaces()
      .filter((ns) => {
        const filter = this.connectionsFilter();
        return !filter || filter.includes(ns.id)
      })
      .map<TreeNode>((ns) => {
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
          data: ns,
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
          data: ns,
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
              topNode.children = topic.subscriptions.map<TreeNode>((sub) => {
                const subNode: TreeNode =
                  {
                    key: `${ns.id}-topic-${topic.id}-subscription-${sub.id}`,
                    label: sub.name,
                    type: 'subscription',
                    expanded: this.opened().includes(`${ns.id}-topic-${topic.id}-subscription-${sub.id}`),
                    data: {
                      namespace: ns,
                      topic,
                      subscription: sub,
                    }
                  }

                if (this.displaySubscriptionRules()) {
                  subNode.children = sub.rules.map<TreeNode>((rule) => ({
                    key: `${ns.id}-topic-${topic.id}-subscription-${sub.id}-rule-${rule.name}`,
                    label: rule.name,
                    type: 'subscription-rule',
                    data: {
                      namespace: ns,
                      topic,
                      subscription: sub,
                      rule,
                    },
                    leaf: true,
                  }));
                }

                return subNode;
              });
            }

            return topNode;
          }),
        });
      }

      return node;
    })
  });

  namespaceSelected = output<{
    namespace: Namespace;
  }>();
  queueSelected = output<{
    namespaceId: string;
    queue: QueueWithMetaData;
  }>();
  topicSelected = output<{
    namespaceId: string;
    topic: TopicWithChildren;
  }>();
  subscriptionSelected = output<{
    namespaceId: string;
    topicId: string;
    subscription: SubscriptionWithMetaData;
  }>();
  subscriptionRuleSelected = output<{
    namespaceId: string;
    topicId: string;
    subscriptionId: string;
    ruleName: string;
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
      case 'subscription-rule':
        this.onSubscriptionRuleSelected(
          event.data.namespace,
          event.data.topic,
          event.data.subscription,
          event.data.rule
        );
        break;
    }
  }

  onNodeExpand(event: TreeNodeExpandEvent) {
    this.opened.update((opened) => [
      ...new Set([...opened, event.node.key as string]),
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

  private onQueueSelected(namespace: Namespace, queue: QueueWithMetaData) {
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
    subscription: SubscriptionWithMetaData
  ) {
    this.subscriptionSelected.emit({
      namespaceId: namespace.id,
      topicId: topic.id,
      subscription,
    });
  }

  private onSubscriptionRuleSelected(
    namespace: Namespace,
    topic: TopicWithChildren,
    subscription: SubscriptionWithMetaData,
    rule: SubscriptionRule
  ) {
    this.subscriptionRuleSelected.emit({
      namespaceId: namespace.id,
      topicId: topic.id,
      subscriptionId: subscription.id,
      ruleName: rule.name,
    });
  }

  refreshQueues($event: MouseEvent, namespace: Namespace) {
    this.store.dispatch(
      TopologyActions.loadQueues({ namespaceId: namespace.id })
    );
    $event.stopPropagation();
  }

  refreshTopics($event: MouseEvent, namespace: Namespace) {
    this.store.dispatch(
      TopologyActions.loadTopics({ namespaceId: namespace.id })
    );
    $event.stopPropagation();
  }

  refreshSubscriptions(namespaceId: UUID, topicId: string) {
    this.store.dispatch(
      TopologyActions.loadSubscriptions({ namespaceId, topicId })
    );
  }

  refreshSubscription(namespaceId: UUID, topicId: string, subscriptionId: string) {
    this.store.dispatch(
      TopologyActions.loadSubscription({ namespaceId, topicId, subscriptionId })
    );
  }
}
