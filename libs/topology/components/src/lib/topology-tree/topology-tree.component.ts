import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
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
} from '@service-bus-browser/api-contracts';
import { messagesActions } from '@service-bus-browser/messages-store';
import { Router } from '@angular/router';
import { ReceiveMessagesDialog } from '@servicebus-browser/messages-components';
import { ActionManager } from '@service-bus-browser/actions-framework';
import { ConfirmationService } from '@service-bus-browser/shared-components';
import { TopologyActions } from '@service-bus-browser/topology-store';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, Subject } from 'rxjs';

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
  actionManager = inject(ActionManager);
  confirmationService = inject(ConfirmationService);

  selectionMode = input<'actions' | 'send'>('actions');
  sendEndpointSelected = output<SendEndpoint>();

  treeSelection = signal<TreeNode<TopologyNode>[]>([]);
  shiftSelected = signal<boolean>(false);

  selectedReceiveEndpoint = model<ReceiveEndpoint | undefined>(undefined);

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

  // Raw search term updated on every keystroke (drives the input binding)
  searchTerm = signal('');

  // Debounced search term (~150 ms) used for actual filtering
  private readonly searchTerm$ = new Subject<string>();
  debouncedSearchTerm = toSignal(
    this.searchTerm$.pipe(debounceTime(150)),
    { initialValue: '' },
  );

  opened = signal<string[]>([]);

  // Whether search is currently active (non-empty debounced term)
  private searchActive = computed(() => this.debouncedSearchTerm().trim() !== '');

  // Selectability-filtered nodes (stage 1)
  private selectabilityFilteredNodes = computed<TopologyNode[]>(() => {
    const selectionMode = this.selectionMode();
    const isSelectable = (node: TopologyNode) => {
      if (selectionMode === 'send') {
        return node.sendEndpoint !== undefined;
      }
      return true;
    };
    const hasSelectableChildren = (node: TopologyNode): boolean => {
      if (node.children) {
        return node.children.some(
          (c) => isSelectable(c) || hasSelectableChildren(c),
        );
      }
      return false;
    };

    const filter = (node: TopologyNode): TopologyNode | null => {
      const selectable = isSelectable(node);
      const selectableChildren = hasSelectableChildren(node);

      if (!selectable && !selectableChildren) {
        return null;
      }

      if (!selectableChildren) {
        return {
          ...node,
          children: undefined,
        };
      }

      return {
        ...node,
        children: node.children?.map(filter).filter((n) => n !== null),
      };
    };

    return this.topologyRootNodes()
      .map(filter)
      .filter((node) => node !== null);
  });

  treeNodes = computed<TreeNode<TopologyNode>[]>(() => {
    const term = this.debouncedSearchTerm().trim().toLowerCase();
    const isSearchActive = term !== '';
    const opened = this.opened();

    if (!isSearchActive) {
      // No search: render normally using user's opened state
      return this.selectabilityFilteredNodes().map((node) =>
        this.toTreeNode(node, false, opened),
      );
    }

    // Search active: filter nodes, collect survivor paths, force-expand ancestors
    const matchedPaths = new Set<string>();
    const ancestorPaths = new Set<string>();

    const nodeMatches = (node: TopologyNode): boolean =>
      node.name.toLowerCase().includes(term);

    // Determine which nodes survive the search
    const collectSurvivors = (
      node: TopologyNode,
      ancestors: string[],
    ): boolean => {
      const selfMatches = nodeMatches(node);

      // If self matches, add all ancestors and self; all descendants are visible (not filtered further)
      if (selfMatches) {
        matchedPaths.add(node.path);
        for (const a of ancestors) ancestorPaths.add(a);
        return true;
      }

      // Check children
      let anyChildSurvives = false;
      if (node.children) {
        for (const child of node.children) {
          if (collectSurvivors(child, [...ancestors, node.path])) {
            anyChildSurvives = true;
          }
        }
      }

      if (anyChildSurvives) {
        ancestorPaths.add(node.path);
        for (const a of ancestors) ancestorPaths.add(a);
      }

      return anyChildSurvives;
    };

    for (const root of this.selectabilityFilteredNodes()) {
      collectSurvivors(root, []);
    }

    // Build filtered tree: keep matched nodes (with full subtree) and ancestors
    const buildFilteredTree = (
      node: TopologyNode,
    ): TreeNode<TopologyNode> | null => {
      const selfMatches = matchedPaths.has(node.path);
      const isAncestor = ancestorPaths.has(node.path);

      if (!selfMatches && !isAncestor) {
        return null;
      }

      // Self matches: show full subtree (no further filtering)
      if (selfMatches) {
        return this.toTreeNode(node, true, opened);
      }

      // Ancestor: filter children, force expanded
      const filteredChildren = (node.children ?? [])
        .map(buildFilteredTree)
        .filter((n): n is TreeNode<TopologyNode> => n !== null);

      return {
        key: node.path,
        data: structuredClone(node),
        expanded: true, // force-open ancestors
        children: filteredChildren,
        leaf: filteredChildren.length === 0,
        selectable: node.selectable,
      };
    };

    return this.selectabilityFilteredNodes()
      .map(buildFilteredTree)
      .filter((n): n is TreeNode<TopologyNode> => n !== null);
  });

  // Whether the current search has no results
  hasNoResults = computed(
    () => this.searchActive() && this.treeNodes().length === 0,
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

  constructor() {
    this.store.dispatch(TopologyActions.loadTopologyRootNodes());

    // Push search term changes into the debounce subject
    effect(() => {
      const term = this.searchTerm();
      untracked(() => this.searchTerm$.next(term));
    });

    // Clear search term when topology root nodes identity changes (workspace switch)
    let previousRootNodes = this.topologyRootNodes();
    effect(() => {
      const rootNodes = this.topologyRootNodes();
      if (rootNodes !== previousRootNodes) {
        previousRootNodes = rootNodes;
        untracked(() => this.searchTerm.set(''));
        untracked(() => this.searchTerm$.next(''));
      }
    });
  }

  private toTreeNode(
    node: TopologyNode,
    forceExpand = false,
    opened: string[] = this.opened(),
  ): TreeNode<TopologyNode> {
    const mapper = (
      node: TopologyNode,
      isRoot: boolean,
    ): TreeNode<TopologyNode> => {
      let children = node.children?.map((node) => mapper(node, false)) ?? [];
      if (isRoot && children.length === 0) {
        children = [
          {
            type: 'no-children',
            key: 'no-children',
            label: 'No children',
            leaf: true,
          },
        ];
      }
      return {
        key: node.path,
        data: structuredClone(node),
        expanded: forceExpand || opened.includes(node.path),
        children: children,
        leaf: children.length === 0,
        selectable: node.selectable,
      };
    };
    return mapper(node, true);
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
    return this.actionManager.handleAction(event);
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

  protected async onClearReceiveEndpointSelected($event: ReceiveEndpoint) {
    const confirmed = await this.confirmationService.confirm(
      'Clear messages',
      `Are you sure you want to clear all messages from ${$event.longDisplayName}?`,
    );
    if (!confirmed) {
      return;
    }

    this.store.dispatch(
      messagesActions.clearEndpoint({
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
