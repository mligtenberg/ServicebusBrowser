import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tree, TreeNodeCollapseEvent, TreeNodeExpandEvent } from 'primeng/tree';
import { PrimeTemplate, TreeNode } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Store } from '@ngrx/store';
import { TopologySelectors } from '@service-bus-browser/topology-store';
import { GenericTreeNodeComponent } from '../generic-tree-node/generic-tree-node.component';
import { TopologyNode } from '@service-bus-browser/message-queue-contracts';

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
  ],
  templateUrl: './topology-tree.component.html',
  styleUrl: './topology-tree.component.scss',
})
export class TopologyTreeComponent {
  store = inject(Store);

  topologyRootNodes = this.store.selectSignal(
    TopologySelectors.selectRootNodes,
  );
  treeNodes = computed(() =>
    this.topologyRootNodes().map((node) => this.toTreeNode(node)),
  );

  searchTerm = signal('');
  opened = signal<string[]>([]);

  private toTreeNode(node: TopologyNode): TreeNode {
    const mapper = (node: TopologyNode): TreeNode => ({
      data: node,
      expanded: this.opened().includes(node.path),
      children: node.children?.map((node) => mapper(node)),
    });
    return mapper(node);
  }

  onNodeExpand(event: TreeNodeExpandEvent) {
    this.opened.update((opened) => [
      ...opened,
      event.node.data.path
    ]);
  }

  onNodeCollapse(event: TreeNodeCollapseEvent) {
    this.opened.update((opened) =>
      opened.filter((key) => key !== event.node.data.path),
    );
  }
}
