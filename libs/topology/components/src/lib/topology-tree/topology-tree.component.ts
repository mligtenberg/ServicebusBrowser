import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Namespace,
  NamespaceWithChildren,
  Queue,
  Subscription,
  TopicWithChildren
} from '@service-bus-browser/topology-contracts';
import { Tree } from 'primeng/tree';
import { PrimeTemplate, TreeNode } from 'primeng/api';
import { NamespaceTreeNodeComponent } from '../namespace-tree-node/namespace-tree-node.component';
import { TopicTreeNodeComponent } from '../topic-tree-node/topic-tree-node.component';
import { SubscriptionTreeNodeComponent } from '../subscription-tree-node/subscription-tree-node.component';
import { QueueTreeNodeComponent } from '../queue-tree-node/queue-tree-node.component';

@Component({
  selector: 'sbb-tpl-topology-tree',
  imports: [
    CommonModule,
    Tree,
    PrimeTemplate,
    NamespaceTreeNodeComponent,
    TopicTreeNodeComponent,
    SubscriptionTreeNodeComponent,
    QueueTreeNodeComponent,
  ],
  templateUrl: './topology-tree.component.html',
  styleUrl: './topology-tree.component.scss',
})
export class TopologyTreeComponent {
  namespaces =
    input.required<NamespaceWithChildren<Queue, TopicWithChildren>[]>();
  nodes = computed<TreeNode[]>(() =>
    this.namespaces().map<TreeNode>((ns, ns_index) => ({
      key: ns_index.toString(),
      label: ns.name,
      type: 'namespace',
      data: ns,
      children: [
        {
          key: `${ns_index}-queues`,
          label: 'Queues',
          selectable: false,
          children: ns.queues.map<TreeNode>((queue, queue_index) => ({
            key: `${ns_index}-queue-${queue_index}`,
            label: queue.name,
            type: 'queue',
            data: {
              namespace: ns,
              queue,
            },
            leaf: true,
          })),
        },
        {
          key: `${ns_index}-topics`,
          label: 'Topics',
          selectable: false,
          children: ns.topics.map<TreeNode>((topic, topic_index) => ({
            key: `${ns_index}-topic-${topic_index}`,
            label: topic.name,
            type: 'topic',
            data: {
              namespace: ns,
              topic,
            },
            children: topic.subscriptions.map<TreeNode>((sub, sub_index) => ({
              key: `${ns_index}-topic-${topic_index}-subscription-${sub_index}`,
              label: sub.name,
              type: 'subscription',
              data: {
                namespace: ns,
                topic,
                subscription: sub,
              },
              leaf: true,
            })),

          })),
        },
      ],
    }))
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
        break
    }
  }

  private onNamespaceSelected(namespace: Namespace) {
    this.namespaceSelected.emit({
      namespace,
    })
  }

  private onQueueSelected(namespace: Namespace, queue: Queue) {
    this.queueSelected.emit({
      namespaceId: namespace.id,
      queue,
    })
  }

  private onTopicSelected(namespace: Namespace, topic: TopicWithChildren) {
    this.topicSelected.emit({
      namespaceId: namespace.id,
      topic,
    })
  }

  private onSubscriptionSelected(namespace: Namespace, topic: TopicWithChildren, subscription: Subscription) {
    this.subscriptionSelected.emit({
      namespaceId: namespace.id,
      topicId: topic.id,
      subscription,
    })
  }
}
