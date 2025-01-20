import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Namespace,
  QueueWithMetaData,
  SubscriptionWithMetaData, TopicWithMetaData,
  TopicWithChildren, SubscriptionRule, NamespaceWithChildrenAndLoadingState
} from '@service-bus-browser/topology-contracts';
import { Tree, TreeNodeCollapseEvent, TreeNodeExpandEvent } from 'primeng/tree';
import { MenuItemCommandEvent, PrimeTemplate, TreeNode } from 'primeng/api';
import { NamespaceTreeNodeComponent } from '../namespace-tree-node/namespace-tree-node.component';
import { TopicTreeNodeComponent } from '../topic-tree-node/topic-tree-node.component';
import { SubscriptionTreeNodeComponent } from '../subscription-tree-node/subscription-tree-node.component';
import { QueueTreeNodeComponent } from '../queue-tree-node/queue-tree-node.component';
import { Button } from 'primeng/button';
import { Store } from '@ngrx/store';
import { TopologyActions } from '@service-bus-browser/topology-store';
import { SbbMenuItem, UUID } from '@service-bus-browser/shared-contracts';
import {
  SubscriptionRuleTreeNodeComponent
} from '../subscription-rule-tree-node/subscription-rule-tree-node.component';
import { ContextMenu } from 'primeng/contextmenu';

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
    SubscriptionRuleTreeNodeComponent,
    ContextMenu,
  ],
  templateUrl: './topology-tree.component.html',
  styleUrl: './topology-tree.component.scss',
  host: {
    '(document:keydown)': 'onKeyDown($event)',
    '(document:keyup)': 'onKeyUp($event)',
  },
})
export class TopologyTreeComponent {
  namespaces = input.required<NamespaceWithChildrenAndLoadingState[]>();
  namespaceContextMenuItems = input<SbbMenuItem<Namespace>[]>();
  queuesGroupNodeContextMenu = input<SbbMenuItem<Namespace>[]>();
  topicsGroupNodeContextMenu = input<SbbMenuItem<Namespace>[]>();
  queueContextMenu = input<SbbMenuItem<QueueWithMetaData>[]>();
  topicContextMenu = input<SbbMenuItem<TopicWithMetaData>[]>();
  subscriptionContextMenu = input<SbbMenuItem<SubscriptionWithMetaData>[]>();
  subscriptionRuleContextMenu = input<SbbMenuItem<SubscriptionRule>[]>();

  selectionMode = signal<'single' | 'multiple'>('single');

  connectionsFilter = input<string[]>();

  displayQueues = input<boolean>(true);
  displayTopics = input<boolean>(true);
  displaySubscriptions = input<boolean>(true);
  displaySubscriptionRules = input<boolean>(true);

  store = inject(Store);

  opened = signal<string[]>([]);
  selection = model<TreeNode[] | null>(null);
  nodes = computed<TreeNode[]>(() => {
    return this.namespaces()
      .filter((ns) => {
        const filter = this.connectionsFilter();
        return !filter || filter.includes(ns.id);
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
              data: queue,
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
                data: topic,
              };

              if (this.displaySubscriptions()) {
                topNode.children = topic.subscriptions.map<TreeNode>((sub) => {
                  const subNode: TreeNode = {
                    key: `${ns.id}-topic-${topic.id}-subscription-${sub.id}`,
                    label: sub.name,
                    type: 'subscription',
                    expanded: this.opened().includes(
                      `${ns.id}-topic-${topic.id}-subscription-${sub.id}`
                    ),
                    data: sub,
                  };

                  if (this.displaySubscriptionRules()) {
                    subNode.children = sub.rules.map<TreeNode>((rule) => ({
                      key: `${ns.id}-topic-${topic.id}-subscription-${sub.id}-rule-${rule.name}`,
                      label: rule.name,
                      type: 'subscription-rule',
                      data: rule,
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
      });
  });
  contextMenu = computed(() => {
    const selection = this.selection();
    const nodeType = selection?.[0]?.type;
    if (!nodeType) {
      return undefined;
    }

    let menuItems: SbbMenuItem<unknown>[] = [];
    if (nodeType === 'namespace') {
      menuItems = this.namespaceContextMenuItems() ?? [];
    }

    if (nodeType === 'queues') {
      menuItems = this.queuesGroupNodeContextMenu() ?? [];
    }

    if (nodeType === 'topics') {
      menuItems = this.topicsGroupNodeContextMenu() ?? [];
    }

    if (nodeType === 'queue') {
      menuItems = this.queueContextMenu() ?? [];
    }

    if (nodeType === 'topic') {
      menuItems = this.topicContextMenu() ?? [];
    }

    if (nodeType === 'subscription') {
      menuItems = this.subscriptionContextMenu() ?? [];
    }

    if (nodeType === 'subscription-rule') {
      menuItems = this.subscriptionRuleContextMenu() ?? [];
    }

    if (selection.length > 1) {
      menuItems = menuItems.filter((item) => item.supportedMultiSelection);
    }

    if (menuItems.length === 0) {
      return undefined;
    }

    return this.patchContextMenuItems(menuItems);
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
    if (!event || (event instanceof Array && event.length === 0)) {
      this.selection.set(null);
      return;
    }

    if (this.selectionMode() === 'multiple') {
      if (!(event instanceof Array) && event) {
        event = [event];
      }
      this.selection.set(event as TreeNode[]);
      this.onMultipleSelectionChange(event ?? []);
      return;
    }

    if (event instanceof Array) {
      console.log(event);
      event = event[event.length - 1];
    }

    console.log('single selection', event);
    this.selection.set([event]);


    switch (event.type) {
      case 'namespace':
        this.onNamespaceSelected(event.data);
        break;
      case 'queue':
        this.onQueueSelected(event.data);
        break;
      case 'topic':
        this.onTopicSelected(event.data);
        break;
      case 'subscription':
        this.onSubscriptionSelected(
          event.data
        );
        break;
      case 'subscription-rule':
        this.onSubscriptionRuleSelected(
          event.data
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

  private onMultipleSelectionChange(event: TreeNode[]) {
    if (event.length === 0) {
      return;
    }

    const first = event[0];
    this.selection.update(
      (selection) => selection?.filter((s) => s.type === first.type) ?? null
    );
  }

  private onNamespaceSelected(namespace: Namespace) {
    this.namespaceSelected.emit({
      namespace,
    });
  }

  private onQueueSelected(queue: QueueWithMetaData) {
    this.queueSelected.emit({
      namespaceId: queue.namespaceId,
      queue,
    });
  }

  private onTopicSelected(topic: TopicWithChildren) {
    this.topicSelected.emit({
      namespaceId: topic.namespaceId,
      topic,
    });
  }

  private onSubscriptionSelected(subscription: SubscriptionWithMetaData) {

    this.subscriptionSelected.emit({
      namespaceId: subscription.namespaceId,
      topicId: subscription.topicId,
      subscription,
    });
  }

  private onSubscriptionRuleSelected(
    rule: SubscriptionRule
  ) {
    this.subscriptionRuleSelected.emit({
      namespaceId: rule.namespaceId,
      topicId: rule.topicId,
      subscriptionId: rule.subscriptionId,
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

  refreshSubscription(
    namespaceId: UUID,
    topicId: string,
    subscriptionId: string
  ) {
    this.store.dispatch(
      TopologyActions.loadSubscription({ namespaceId, topicId, subscriptionId })
    );
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.selectionMode.set('multiple');
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.selectionMode.set('single');
    }
  }

  patchContextMenuItems(menuItems: SbbMenuItem<unknown>[]) {
    return menuItems.map((item): SbbMenuItem<unknown> => {
      return {
        ...item,
        command: (event: MenuItemCommandEvent) => {
          const selection = this.selection();
          if (!selection) {
            return;
          }

          const data = selection.length === 1 ? selection[0].data : selection.map((node) => node.data);

          item.onSelect?.(data, event)
        },
        menuItems: item.menuItems ? this.patchContextMenuItems(item.menuItems) : undefined,
      };
    });
  }
}
