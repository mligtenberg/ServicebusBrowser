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
import { FormsModule } from '@angular/forms';
import {
  SbbAutocomplete,
  SbbAutocompleteGroup,
  SbbAutocompleteGroupLabelDef,
  SbbAutocompleteItemDef,
  SbbTree,
  SbbTreeNode,
  SbbTreeNodeDef,
} from '@service-bus-browser/shared-ui';
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

/**
 * View-model node handed to {@link SbbTree}. `id` is the topology `path`; the
 * `data` payload rides along for the node template. `placeholder` nodes are the
 * synthetic "No topology found" rows shown under a childless root.
 */
interface TopologyTreeNode extends SbbTreeNode {
  id: string;
  data?: TopologyNode;
  placeholder?: boolean;
  selectable?: boolean;
}

@Component({
  selector: 'sbb-tpl-topology-tree',
  imports: [
    FormsModule,
    SbbTree,
    SbbTreeNodeDef,
    SbbAutocomplete,
    SbbAutocompleteItemDef,
    SbbAutocompleteGroupLabelDef,
    GenericTreeNodeComponent,
    ReceiveMessagesDialog,
  ],
  templateUrl: './topology-tree.component.html',
  styleUrl: './topology-tree.component.scss',
})
export class TopologyTreeComponent {
  store = inject(Store);
  router = inject(Router);
  actionManager = inject(ActionManager);
  confirmationService = inject(ConfirmationService);

  selectionMode = input<'actions' | 'send'>('actions');
  sendEndpointSelected = output<SendEndpoint>();

  treeSelection = signal<TopologyTreeNode[]>([]);

  selectedReceiveEndpoint = model<ReceiveEndpoint | undefined>(undefined);

  multiSelectEnabled = computed(() => this.selectionMode() === 'actions');
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

  /** Text bound to the autocomplete input; set to '' to clear it after a chip is added. */
  autocompleteText = signal<string>('');

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

  // ── Suggestion state ──────────────────────────────────────────────────────

  suggestions = signal<SuggestionGroup[]>([]);

  /** Adapts SuggestionGroup → SbbAutocompleteGroup for the SbbAutocomplete input. */
  protected suggestionGroups = computed<SbbAutocompleteGroup<SuggestionItem>[]>(
    () => this.suggestions().map((g) => ({ label: g.groupLabel, items: g.items })),
  );

  opened = signal<string[]>([]);

  /**
   * Restricts shift-range selection to nodes of the same topology type
   * (SbbTree evaluates this against the just-clicked node). Replaces the old
   * hand-rolled same-type range logic.
   */
  protected readonly rangeFilter = (
    candidate: TopologyTreeNode,
    clicked: TopologyTreeNode,
  ): boolean => candidate.data?.type === clicked.data?.type;

  /** Narrows the base `SbbTreeNode` handed to the node template back to our view-model. */
  protected readonly asTreeNode = (node: SbbTreeNode): TopologyTreeNode =>
    node as TopologyTreeNode;

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

  treeNodes = computed<TopologyTreeNode[]>(() => {
    const chips = this.searchQuery().chips;
    const term = this.debouncedFreeText().trim().toLowerCase();
    const isFilterActive = chips.length > 0 || term !== '';

    if (!isFilterActive) {
      return this.selectabilityFilteredNodes().map((node) =>
        this.toTreeNode(node),
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
    ): TopologyTreeNode | null => {
      const selfMatches = matchedPaths.has(node.path);
      const isAncestor = ancestorPaths.has(node.path);

      if (!selfMatches && !isAncestor) {
        return null;
      }

      if (selfMatches) {
        return this.toTreeNode(node);
      }

      // Ancestor: keep only the surviving children.
      const filteredChildren = (node.children ?? [])
        .map(buildFilteredTree)
        .filter((n): n is TopologyTreeNode => n !== null);

      return {
        id: node.path,
        data: structuredClone(node),
        children: filteredChildren,
        selectable: node.selectable,
      };
    };

    return this.selectabilityFilteredNodes()
      .map(buildFilteredTree)
      .filter((n): n is TopologyTreeNode => n !== null);
  });

  // Whether the current search has no results
  hasNoResults = computed(
    () => this.searchActive() && this.treeNodes().length === 0,
  );

  /**
   * Ids of expanded nodes fed to SbbTree. While a search filter is active every
   * non-leaf node in the (already-pruned) result is force-expanded — mirroring
   * the old PrimeNG `expanded: true` on matches/ancestors; otherwise expansion
   * follows the user's manual `opened` set.
   */
  expandedIds = computed<string[]>(() => {
    if (!this.searchActive()) {
      return this.opened();
    }
    const ids: string[] = [];
    const walk = (nodes: TopologyTreeNode[]) => {
      for (const n of nodes) {
        if (n.children && n.children.length > 0) {
          ids.push(n.id);
          walk(n.children);
        }
      }
    };
    walk(this.treeNodes());
    return ids;
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

  private topologyLoaded = this.store.selectSignal(TopologySelectors.selectLoaded);

  constructor() {
    if (!this.topologyLoaded()) {
      this.store.dispatch(TopologyActions.loadTopologyRootNodes());
    }

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
   * PrimeNG emits (onClear) when the input is emptied (including via backspace),
   * and in that case it does NOT call completeMethod — so we must reset the
   * free-text filter here, otherwise the last term keeps filtering/highlighting.
   */
  onSearchCleared() {
    this.searchInputText.set('');
    this.freeText$.next('');
    this.suggestions.set([]);
  }

  /**
   * Called by the AutoComplete on every keystroke (and on focus-complete).
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
   * entity types are shown, each filtered by the full fragment.
   *
   * In both modes:
   * - Typed text drives live free-text tree filtering on every keystroke.
   * - Suggestions are chip-scoped (nodes must satisfy existing chips).
   * - Prefix matches rank above substring matches within each type group.
   * - At most SUGGESTION_TOTAL_CAP entity rows are shown in total across all groups.
   * - Suggestions are only shown when the typed query is >= 3 characters.
   */
  onComplete(query: string) {
    const typed = query.trim();

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
   * Entity suggestions → create a chip.
   */
  onSuggestionSelect(item: SuggestionItem) {
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
    this.autocompleteText.set('');
  }

  /**
   * Called when the user removes a chip via its × button.
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

  private toTreeNode(node: TopologyNode): TopologyTreeNode {
    const mapper = (node: TopologyNode, isRoot: boolean): TopologyTreeNode => {
      let children = node.children?.map((child) => mapper(child, false)) ?? [];
      if (isRoot && children.length === 0) {
        children = [
          { id: `${node.path}\0no-children`, placeholder: true, selectable: false },
        ];
      }
      return {
        id: node.path,
        data: structuredClone(node),
        children,
        selectable: node.selectable,
      };
    };
    return mapper(node, true);
  }

  onNodeExpand(node: TopologyTreeNode) {
    this.opened.update((opened) => [...opened, node.id]);
  }

  onNodeCollapse(node: TopologyTreeNode) {
    this.opened.update((opened) => opened.filter((id) => id !== node.id));
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

  /** Mirrors the tree's selection so `nodeSelectionMode` can react to its size. */
  protected onSelectionChange(nodes: TopologyTreeNode[]) {
    this.treeSelection.set(nodes);
  }

  /**
   * Fires a node's default action / send-endpoint on a plain navigational
   * click (which resolves to a single selection). Shift/Ctrl multi-selections
   * do not navigate — they only build the selection for bulk actions.
   */
  protected onNodeSelect(node: TopologyTreeNode) {
    if (this.treeSelection().length !== 1) {
      return;
    }
    const data = node.data;
    if (!data) {
      return;
    }
    if (this.selectionMode() === 'send' && data.sendEndpoint) {
      this.sendEndpointSelected.emit(data.sendEndpoint);
    }
    if (this.selectionMode() === 'actions' && data.defaultAction) {
      this.onActionSelected(data.defaultAction);
    }
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
