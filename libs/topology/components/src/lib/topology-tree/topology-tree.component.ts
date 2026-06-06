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
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import {
  EMPTY_QUERY,
  EXCLUDED_TAG_TYPES,
  isQueryEmpty,
  rankByPrefix,
  resolveAcceleratorType,
  SearchChip,
  SearchQuery,
  SUGGESTION_TOTAL_CAP,
  SuggestionGroup,
  SuggestionItem,
} from '../search/search-query.model';

@Component({
  selector: 'sbb-tpl-topology-tree',
  imports: [
    CommonModule,
    FormsModule,
    Tree,
    PrimeTemplate,
    GenericTreeNodeComponent,
    ReceiveMessagesDialog,
    AutoComplete,
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

  // ── Search query ──────────────────────────────────────────────────────────

  /** The full structured query (chips + free text). */
  searchQuery = signal<SearchQuery>(EMPTY_QUERY);

  /**
   * The raw string currently in the AutoComplete text field (the part the user
   * is typing right now, AFTER existing chips).  This drives the debounce and
   * the suggestion list.
   */
  searchInputText = signal('');

  // Debounced free-text term (~150 ms) — used for actual tree filtering
  private readonly freeText$ = new Subject<string>();
  debouncedFreeText = toSignal(
    this.freeText$.pipe(debounceTime(150)),
    { initialValue: '' },
  );

  /** The list of chips from the current query (convenience accessor for the template). */
  currentChips = computed(() => this.searchQuery().chips);

  /** True when any filtering is active (chips or free text). */
  private searchActive = computed(() => !isQueryEmpty({
    chips: this.searchQuery().chips,
    freeText: this.debouncedFreeText(),
  }));

  // The autocomplete value binding — we only ever use the chip model internally;
  // PrimeNG multiple mode needs the chip objects bound, so we bind currentChips.
  // We use a fake ngModel value (not chips) since our chips are managed manually.
  autocompleteValue = signal<SuggestionItem[]>([]);

  // ── Suggestion state ──────────────────────────────────────────────────────

  suggestions = signal<SuggestionGroup[]>([]);

  opened = signal<string[]>([]);

  // ── Stage 1: selectability filter ────────────────────────────────────────

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

  // ── Stage 2: chip + free-text filter ─────────────────────────────────────

  treeNodes = computed<TreeNode<TopologyNode>[]>(() => {
    const chips = this.searchQuery().chips;
    const term = this.debouncedFreeText().trim().toLowerCase();
    const isFilterActive = chips.length > 0 || term !== '';
    const opened = this.opened();

    if (!isFilterActive) {
      return this.selectabilityFilteredNodes().map((node) =>
        this.toTreeNode(node, false, opened),
      );
    }

    const matchedPaths = new Set<string>();
    const ancestorPaths = new Set<string>();

    /**
     * A node is a PRIMARY MATCH when:
     *  - For every chip c: the path root → node contains a node of type c.type
     *    whose name equals c.value (exact, case-insensitive).
     *  - AND (term empty) OR (node.name contains term, case-insensitive).
     */
    const nodeMatchesChips = (
      node: TopologyNode,
      ancestorPath: TopologyNode[],
    ): boolean => {
      if (chips.length === 0) return true;
      const allNodes = [...ancestorPath, node];
      return chips.every((chip) =>
        allNodes.some(
          (n) =>
            n.type === chip.type &&
            n.name.toLowerCase() === chip.value.toLowerCase(),
        ),
      );
    };

    const nodeMatchesFreeText = (node: TopologyNode): boolean =>
      term === '' || node.name.toLowerCase().includes(term);

    const nodeIsPrimaryMatch = (
      node: TopologyNode,
      ancestorPath: TopologyNode[],
    ): boolean =>
      nodeMatchesChips(node, ancestorPath) && nodeMatchesFreeText(node);

    const collectSurvivors = (
      node: TopologyNode,
      ancestors: TopologyNode[],
      ancestorPaths_: string[],
    ): boolean => {
      const selfMatches = nodeIsPrimaryMatch(node, ancestors);

      if (selfMatches) {
        matchedPaths.add(node.path);
        for (const a of ancestorPaths_) ancestorPaths.add(a);
        return true;
      }

      let anyChildSurvives = false;
      if (node.children) {
        for (const child of node.children) {
          if (
            collectSurvivors(child, [...ancestors, node], [
              ...ancestorPaths_,
              node.path,
            ])
          ) {
            anyChildSurvives = true;
          }
        }
      }

      if (anyChildSurvives) {
        ancestorPaths.add(node.path);
        for (const a of ancestorPaths_) ancestorPaths.add(a);
      }

      return anyChildSurvives;
    };

    for (const root of this.selectabilityFilteredNodes()) {
      collectSurvivors(root, [], []);
    }

    // Build filtered tree: keep matched nodes (full subtree) and ancestors
    const buildFilteredTree = (
      node: TopologyNode,
    ): TreeNode<TopologyNode> | null => {
      const selfMatches = matchedPaths.has(node.path);
      const isAncestor = ancestorPaths.has(node.path);

      if (!selfMatches && !isAncestor) {
        return null;
      }

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
        expanded: true,
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

  // ── Chip exact-match set (for highlight) ─────────────────────────────────

  /**
   * A set of `"type\0value"` strings for O(1) lookup in the tree template.
   * (Using null byte as a delimiter that can never appear in type/value.)
   */
  chipMatchKeys = computed<Set<string>>(() => {
    const keys = new Set<string>();
    for (const chip of this.searchQuery().chips) {
      keys.add(`${chip.type}\0${chip.value.toLowerCase()}`);
    }
    return keys;
  });

  constructor() {
    this.store.dispatch(TopologyActions.loadTopologyRootNodes());

    // Push free-text changes into the debounce subject
    effect(() => {
      const text = this.searchInputText();
      untracked(() => this.freeText$.next(text));
    });

    // Clear search when topology root nodes identity changes (workspace switch)
    let previousRootNodes = this.topologyRootNodes();
    effect(() => {
      const rootNodes = this.topologyRootNodes();
      if (rootNodes !== previousRootNodes) {
        previousRootNodes = rootNodes;
        untracked(() => {
          this.searchQuery.set(EMPTY_QUERY);
          this.searchInputText.set('');
          this.freeText$.next('');
        });
      }
    });
  }

  // ── Autosuggest ───────────────────────────────────────────────────────────

  /**
   * Called by PrimeNG AutoComplete on every keystroke.
   *
   * Two modes:
   *
   * **Accelerator mode** — the typed fragment starts with a known tag-key
   * immediately followed by a colon (e.g. `exchange:`, `eventHub:rabbit`).
   * Only entity suggestions of that single type are shown, filtered by the
   * value portion after the colon.  If that type already has a chip, no
   * entity rows are emitted (one-chip-per-type still applies).
   *
   * **Blended mode** — the fragment does NOT start with `key:`.  All eligible
   * entity types are shown, each filtered by the full fragment (existing
   * behaviour, unchanged).
   *
   * In both modes:
   * - Typed text drives live free-text tree filtering on every keystroke.
   * - Suggestions are chip-scoped (nodes must satisfy existing chips).
   * - Prefix matches rank above substring matches within each type group.
   * - At most SUGGESTION_TOTAL_CAP entity rows are shown in total across all groups.
   * - Suggestions are only shown when the typed query is >= 3 characters.
   */
  /**
   * PrimeNG emits (onClear) when the input is emptied (including via backspace),
   * and in that case it does NOT call completeMethod — so we must reset the
   * free-text filter here, otherwise the last term keeps filtering/highlighting.
   */
  onSearchCleared() {
    this.searchInputText.set('');
    this.freeText$.next('');
    this.suggestions.set([]);
  }

  onComplete(event: AutoCompleteCompleteEvent) {
    const typed = event.query.trim();

    // Point 1: drive live free-text filtering from every keystroke
    this.searchInputText.set(typed);

    const chips = this.searchQuery().chips;

    // Types that already have a chip — never offered again
    const usedTypes = new Set(chips.map((c) => c.type));

    // Point 3: only build and show tag suggestions when >=3 chars are typed
    if (typed.length < 3) {
      this.suggestions.set([]);
      return;
    }

    // ── Accelerator detection ──────────────────────────────────────────────
    // Determine the set of runtime tag keys (non-excluded, non-structural types
    // present in selectabilityFilteredNodes).
    const availableTypes = this.collectAvailableTypes();

    // Does the typed fragment start with "<key>:" (key is a known type)?
    let acceleratorType: string | null = null;
    let valueFragment = '';
    const colonIdx = typed.indexOf(':');
    if (colonIdx > 0) {
      const keyPart = typed.slice(0, colonIdx);
      const resolved = resolveAcceleratorType(keyPart, availableTypes);
      if (resolved !== null) {
        acceleratorType = resolved;
        valueFragment = typed.slice(colonIdx + 1).trimStart();
      }
    }

    // ── Collect matching names per type ────────────────────────────────────
    // In accelerator mode we only collect for the resolved type;
    // in blended mode we collect for all non-used types.
    const grouped = new Map<string, string[]>(); // type → de-duped names (unranked)

    const walkForSuggestions = (
      node: TopologyNode,
      ancestorPath: TopologyNode[],
    ) => {
      if (EXCLUDED_TAG_TYPES.has(node.type)) {
        node.children?.forEach((c) =>
          walkForSuggestions(c, [...ancestorPath, node]),
        );
        return;
      }

      const isTargetType = acceleratorType !== null
        ? node.type === acceleratorType
        : !usedTypes.has(node.type);

      if (isTargetType) {
        // Skip if type already has a chip (one-chip-per-type)
        if (!usedTypes.has(node.type)) {
          // Check chip scoping
          const allNodes = [...ancestorPath, node];
          const satisfiesChips = chips.every((chip) =>
            allNodes.some(
              (n) =>
                n.type === chip.type &&
                n.name.toLowerCase() === chip.value.toLowerCase(),
            ),
          );

          if (satisfiesChips) {
            // In accelerator mode filter by valueFragment; in blended mode by typed
            const filterFragment = acceleratorType !== null ? valueFragment : typed;
            const nameLower = node.name.toLowerCase();
            const fragmentLower = filterFragment.toLowerCase();
            if (filterFragment === '' || nameLower.includes(fragmentLower)) {
              const list = grouped.get(node.type) ?? [];
              if (!list.includes(node.name)) {
                list.push(node.name);
                grouped.set(node.type, list);
              }
            }
          }
        }
      }

      node.children?.forEach((c) =>
        walkForSuggestions(c, [...ancestorPath, node]),
      );
    };

    this.selectabilityFilteredNodes().forEach((root) =>
      walkForSuggestions(root, []),
    );

    // ── Build suggestion groups with a TOTAL cap of SUGGESTION_TOTAL_CAP ──
    // Point 4: at most SUGGESTION_TOTAL_CAP entity rows in total across all groups.
    const groups: SuggestionGroup[] = [];

    // Determine the fragment used for ranking inside each group
    const rankFragment = acceleratorType !== null ? valueFragment : typed;

    let remaining = SUGGESTION_TOTAL_CAP;

    for (const [type, names] of grouped) {
      if (remaining <= 0) break;

      // Rank: prefix matches first, then substring; alphabetical within tiers
      const ranked = rankByPrefix(names, rankFragment);

      const capped = ranked.slice(0, remaining);
      remaining -= capped.length;

      const items: SuggestionItem[] = capped.map((name) => ({
        kind: 'entity' as const,
        type,
        label: name,
        groupLabel: type,
      }));

      groups.push({ groupLabel: type, items });
    }

    // Point 2: NO free-text row is ever added to the dropdown.

    this.suggestions.set(groups);
  }

  /**
   * Collect the set of distinct node types present in selectabilityFilteredNodes,
   * excluding structural / excluded types.  Used by onComplete() to derive the
   * runtime accelerator key set.
   */
  private collectAvailableTypes(): string[] {
    const types = new Set<string>();
    const walk = (node: TopologyNode) => {
      if (!EXCLUDED_TAG_TYPES.has(node.type)) {
        types.add(node.type);
      }
      node.children?.forEach(walk);
    };
    this.selectabilityFilteredNodes().forEach(walk);
    return [...types];
  }

  /**
   * Called when the user selects an item from the suggestion dropdown.
   * Entity suggestions → create a chip; free-text row → set trailing free text.
   *
   * We use `onSelect` from the AutoComplete (not `(ngModelChange)`) so we can
   * distinguish entity vs. free-text choices.
   */
  onSuggestionSelect(event: AutoCompleteSelectEvent) {
    const item = event.value as SuggestionItem;

    if (item.kind === 'entity') {
      const newChip: SearchChip = { type: item.type, value: item.label };
      this.searchQuery.update((q) => ({
        // Point 5: clear freeText when a chip is created
        chips: [...q.chips, newChip],
        freeText: '',
      }));
      // Point 5: reset live free-text signal and push empty through debounce
      this.searchInputText.set('');
      this.freeText$.next('');
    }
    // 'truncation' items are informational only — clicking them is a no-op.

    // Reset the autocomplete's visible value back to empty so the field is clear
    this.autocompleteValue.set([]);
  }

  /**
   * Called when the user removes a chip via the AutoComplete's × button.
   * We ignore the PrimeNG ngModel update and manage chips manually.
   */
  removeChip(chip: SearchChip) {
    this.searchQuery.update((q) => ({
      ...q,
      chips: q.chips.filter(
        (c) => !(c.type === chip.type && c.value === chip.value),
      ),
    }));
  }

  /** Human-readable label shown inside the chip pill (no brackets). */
  chipLabel(chip: SearchChip): string {
    return `${chip.type}: ${chip.value}`;
  }

  // ── Tree helpers ──────────────────────────────────────────────────────────

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

  /**
   * Returns true if a tree node's data should be highlighted as an exact chip match.
   * Used by the template to set [exactMatch] on GenericTreeNodeComponent.
   */
  protected isExactChipMatch(node: TopologyNode | undefined): boolean {
    if (!node) return false;
    const keys = this.chipMatchKeys();
    return keys.has(`${node.type}\0${node.name.toLowerCase()}`);
  }
}
