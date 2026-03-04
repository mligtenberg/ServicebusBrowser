import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tree, TreeNodeCollapseEvent, TreeNodeExpandEvent } from 'primeng/tree';
import { PrimeTemplate, TreeNode } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import { TopologySelectors } from '@service-bus-browser/topology-store';
import { GenericTreeNodeComponent } from '../generic-tree-node/generic-tree-node.component';
import {
  ReceiveEndpoint,
  SendEndpoint,
  TopologyAction,
  TopologyNode,
} from '@service-bus-browser/message-queue-contracts';
import { MessagesActions } from '@service-bus-browser/messages-store';
import { Router } from '@angular/router';
import { ReceiveMessagesDialog } from '@servicebus-browser/messages-components';

@Component({
  selector: 'sbb-tpl-topology-tree',
  imports: [
    CommonModule,
    FormsModule,
    Tree,
    PrimeTemplate,
    InputText,
    Tooltip,
    GenericTreeNodeComponent,
    ReceiveMessagesDialog,
  ],
  templateUrl: './topology-tree.component.html',
  styleUrl: './topology-tree.component.scss',
  host: {
    '(document:keydown)': 'onKeyDown($event)',
    '(document:keyup)': 'onKeyUp($event)',
  },
})
export class TopologyTreeComponent {
  store = inject(Store);
  router = inject(Router);

  selectionMode = input<'actions' | 'send'>('actions');
  sendEndpointSelected = output<SendEndpoint>();

  treeSelection = signal<TreeNode<TopologyNode>[]>([]);
  shiftSelected = signal<boolean>(false);

  selectedReceiveEndpoint = signal<ReceiveEndpoint | undefined>(undefined);

  multiSelectEnabled = computed(() => this.selectionMode() === 'actions');
  treeSelectionMode = computed<'single' | 'multiple'>(() => {
    if (!this.multiSelectEnabled()) {
      return 'single';
    }

    return this.shiftSelected() ? 'multiple' : 'single';
  });
  nodeSelectionMode = computed<'actions' | 'send' | 'none'>(() => {
    if (this.treeSelection().length > 1) {
      return 'none';
    }

    return this.selectionMode();
  });

  topologyRootNodes = this.store.selectSignal(
    TopologySelectors.selectRootNodes,
  );
  treeNodes = computed<TreeNode<TopologyNode>[]>(() =>
    this.topologyRootNodes().map((node) => this.toTreeNode(node)),
  );
  flatTreeNodes = computed<TreeNode<TopologyNode>[]>(() => {
    const flatten = (
      nodes: TreeNode<TopologyNode>[],
    ): TreeNode<TopologyNode>[] => {
      return nodes.flatMap((node) => {
        return [node, ...(node.children ? flatten(node.children) : [])];
      });
    };

    return flatten(this.treeNodes());
  });

  searchTerm = signal('');
  opened = signal<string[]>([]);

  private toTreeNode(node: TopologyNode): TreeNode<TopologyNode> {
    const mapper = (node: TopologyNode): TreeNode<TopologyNode> => ({
      key: node.path,
      data: node,
      expanded: this.opened().includes(node.path),
      children: node.children?.map((node) => mapper(node)),
      leaf: !node.children || node.children.length === 0,
      selectable: node.selectable,
    });
    return mapper(node);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.shiftSelected.set(true);
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.shiftSelected.set(false);
    }
  }

  onNodeExpand(event: TreeNodeExpandEvent) {
    this.opened.update((opened) => [...opened, event.node.data.path]);
  }

  onNodeCollapse(event: TreeNodeCollapseEvent) {
    this.opened.update((opened) =>
      opened.filter((key) => key !== event.node.data.path),
    );
  }

  protected onActionSelected(event: TopologyAction) {
    console.log(event);
  }

  protected onReceiveEndpointSelected(event: ReceiveEndpoint) {
    this.selectedReceiveEndpoint.set(event);
  }

  protected async onSendEndpointSelected(event: SendEndpoint) {
    await this.router.navigate(['/messages/send'], {
      state: {
        sendEndpoint: event,
      },
    });
  }

  protected onClearReceiveEndpointSelected($event: ReceiveEndpoint) {
    this.store.dispatch(
      MessagesActions.clearEndpoint({
        endpoint: $event,
      }),
    );
  }

  protected onSelectionChange(
    event: TreeNode<TopologyNode> | TreeNode<TopologyNode>[] | null | undefined,
  ) {
    // should not be an array since we have selection mode single
    if (!event || (event instanceof Array && event.length === 0)) {
      this.treeSelection.set([]);
      return;
    }

    if (!(event instanceof Array)) {
      event = [event];
    }

    if (this.treeSelectionMode() === 'multiple') {
      if (this.shiftSelected()) {
        const flatNodes = this.flatTreeNodes();
        const newestSelected = event[event.length - 1];
        const oneBefore = event[event.length - 2];
        const nodeType = newestSelected.type;

        const newestSelectedIndex = flatNodes.findIndex(
          (node) => node.key === newestSelected.key,
        );
        const oneBeforeIndex = flatNodes.findIndex(
          (node) => node.key === oneBefore.key,
        );

        const inbetweenNodes = flatNodes
          .slice(
            Math.min(oneBeforeIndex, newestSelectedIndex),
            Math.max(oneBeforeIndex, newestSelectedIndex) + 1,
          )
          .filter((node) => node.type === nodeType);

        event = [
          ...event.filter((node) => !inbetweenNodes.includes(node)),
          ...inbetweenNodes,
        ].filter((node) => node.data?.selectable ?? false);
      }
    }

    if (this.treeSelectionMode() === 'single') {
      // last item
      event = event.slice(-1);

      if (this.selectionMode() === 'send' && event[0]?.data?.sendEndpoint) {
        this.sendEndpointSelected.emit(event[0].data.sendEndpoint);
      }
      if (this.selectionMode() === 'actions' && event[0]?.data?.defaultAction) {
        this.onActionSelected(event[0].data.defaultAction);
      }
    }

    this.treeSelection.set(event);
  }
}
